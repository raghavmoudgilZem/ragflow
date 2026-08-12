package com.ragflow.document.service;

import com.ragflow.document.client.FileServiceClient;
import com.ragflow.document.client.KnowledgebaseServiceClient;
import com.ragflow.document.client.RagClient;
import com.ragflow.document.client.UserTenantServiceClient;
import com.ragflow.document.dto.*;
import com.ragflow.document.dto.request.DocumentCreateRequest;
import com.ragflow.document.dto.request.DocumentListRequest;
import com.ragflow.document.dto.request.InitializeKbFolderRequest;
import com.ragflow.document.dto.response.*;
import com.ragflow.document.enums.TaskStatus;
import com.ragflow.document.model.Document;
import com.ragflow.document.model.File2Document;
import com.ragflow.document.repository.DocumentRepository;
import com.ragflow.document.repository.DocumentSpecification;
import com.ragflow.document.repository.File2DocumentRepository;
import com.ragflow.document.utility.Utility;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.ragflow.document.utility.Utility.extractSuffix;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    @Value("${app.max-file-num-per-user:0}")
    private int maxFileNumPerUser;

    private static final int MAX_RETRIES = 1000;

    private static final Pattern COUNTER_PATTERN =
            Pattern.compile("^(.*)\\((\\d+)\\)$");

    private static final int FILE_NAME_LEN_LIMIT = 255;
    private static final String IMG_BASE64_PREFIX = "data:image/png;base64,";

    private final KnowledgebaseServiceClient kbClient;
    private final FileServiceClient fileClient;
    private final UserTenantServiceClient tenantClient;
    private final DocumentRepository documentRepository;
    private final File2DocumentRepository file2DocumentRepository;
    private final RagClient ragClient;

    public FileUploadResponse processFileUpload(String kbId, List<MultipartFile> files, String currentUserId) {

        // Fetch Knowledgebase
        KnowledgebaseDto kb = kbClient.getKbById(kbId);
        if (kb == null) {
            throw new NoSuchElementException("Can't find this dataset!");
        }

        // Check Permissions
        if (!tenantClient.checkKbTeamPermission(kb, currentUserId)) {
            throw new SecurityException("No authorization.");
        }

        List<String> errors = new ArrayList<>();
        List<String> fileNames = new ArrayList<>();

        // Execute file upload, fail only error files
        FileResponse file = fileClient.initializeKnowledgeBaseFolder(
                new InitializeKbFolderRequest(currentUserId, kb.tenantId(), kb.name())
        );
        for (MultipartFile multipartFile : files) {
            try {
                checkDocHealth(kb.tenantId(),multipartFile.getOriginalFilename());
            } catch (Exception e) {
                errors.add(multipartFile.getOriginalFilename() + ": " + e.getMessage());
                log.error("Failed to upload {}", multipartFile.getOriginalFilename(), e);
                continue;
            }
            String filename = duplicateName(multipartFile.getOriginalFilename(),kb.id());

            Document document = new Document();
            document.setKbId(kb.id());
            document.setPipelineId(kb.pipelineId());
            document.setParserConfig(kb.parserConfig());
            document.setCreatedBy(currentUserId);
            document.setName(filename);
            document.setSourceType("local");
            document.setSuffix(Utility.getFileExtension(filename));

            Document savedDoc = documentRepository.save(document);
            UploadStorageResponse storageResponse = fileClient.uploadKnowledgeBaseFile(multipartFile, kb.id(), savedDoc.getId());
            if(storageResponse==null){
                documentRepository.delete(savedDoc);
              errors.add(multipartFile.getOriginalFilename());
              continue;
            }

            savedDoc.setParserId(Utility.getParser(storageResponse.fileType(), filename, kb.parserId()));
            savedDoc.setType(storageResponse.fileType());
            savedDoc.setLocation(storageResponse.location());
            savedDoc.setSize(storageResponse.size());
            savedDoc.setThumbnail(storageResponse.thumbnailLocation());

            documentRepository.save(savedDoc);


            file2DocumentRepository.save(File2Document.builder().fileId(file.id()).documentId(savedDoc.getId()).build());
            fileNames.add(multipartFile.getOriginalFilename());
        }
        // Evaluate the Response
        if (!errors.isEmpty()) {
            List<String> uploadedFiles = fileNames.isEmpty() ?  List.of() : fileNames;
            return new FileUploadResponse(errors, uploadedFiles);
        }

        if (fileNames.isEmpty()) {
          throw new IllegalArgumentException("There seems to be an issue with your file format. Please verify it is correct and not corrupted");
        }

        return new FileUploadResponse(errors, fileNames);
    }

    private void checkDocHealth(String tenantId, String filename) {
        List<String> kbByTenantId = kbClient.getKbByTenantId(tenantId);
        if (maxFileNumPerUser > 0 &&
                documentRepository.countByKbIdIn(kbByTenantId) >= maxFileNumPerUser) {
            throw new RuntimeException("Exceed the maximum file number of a free user!");
        }

        if (filename.getBytes(StandardCharsets.UTF_8).length > FILE_NAME_LEN_LIMIT) {
            throw new RuntimeException("Exceed the maximum length of file name!");
        }
    }

    public String duplicateName(String originalName, String kbId) {

        if (originalName == null || originalName.isBlank()) {
            throw new IllegalArgumentException("Filename cannot be null or blank.");
        }

        String currentName = originalName;
        for (int retries = 0; retries < MAX_RETRIES; retries++) {
            boolean documentExist = documentRepository.existsByNameAndKbId(currentName, kbId);
            if (!documentExist) {
                return currentName;
            }

            Path path = Path.of(currentName);
            String filename = path.getFileName().toString();
            int dotIndex = filename.lastIndexOf('.');
            String stem = dotIndex > 0
                    ? filename.substring(0, dotIndex)
                    : filename;

            String suffix = dotIndex > 0
                    ? filename.substring(dotIndex)
                    : "";

            Matcher matcher = COUNTER_PATTERN.matcher(stem);

            String mainPart;
            int counter;

            if (matcher.matches()) {
                mainPart = matcher.group(1);
                counter = Integer.parseInt(matcher.group(2)) + 1;
            } else {
                mainPart = stem;
                counter = 1;
            }

            currentName = mainPart + "(" + counter + ")" + suffix;
        }

        throw new RuntimeException(
                "Failed to generate unique filename within "
                        + MAX_RETRIES
                        + " attempts. Original: "
                        + originalName);
    }

    public Document createDocument(DocumentCreateRequest request, String currentUserId) {

        // 1. Fetch KB
        KnowledgebaseDto kb = kbClient.getKbById(request.kbId());
        if (kb == null) {
            throw new IllegalArgumentException("Can't find this dataset!");
        }

        // 2. Check for duplicates
        boolean exists = documentRepository.existsByNameAndKbId(request.name(), request.kbId());
        if (exists) {
            throw new IllegalArgumentException("Duplicated document name in the same dataset.");
        }

        // 3. Prepare new Document DTO
        String suffix = extractSuffix(request.name());

        FileResponse fileResponse = fileClient.getKbFolder(kb.tenantId(), kb.name());
        if(fileResponse == null) {
            throw new IllegalArgumentException("Cannot find the kb folder for the file.");
        }
        Document document = Document.builder()
                .kbId(kb.id())
                .parserId(kb.parserId())
                .pipelineId(kb.pipelineId())
                .parserConfig(kb.parserConfig())
                .createdBy(currentUserId)
                .type(fileResponse.type())
                .name(request.name())
                .suffix(suffix)
                .location("")
                .size(0)
                .chunkNum(0)
                .build();

        // 4. Insert Document
        Document savedDoc = documentRepository.save(document);

        // 5. Consolidated File Service orchestration
        if (!file2DocumentRepository.existsByDocumentId(savedDoc.getId())) {
          file2DocumentRepository.save(
              File2Document.builder().fileId(fileResponse.id()).documentId(savedDoc.getId()).build());
        }
        return savedDoc;
    }

    public PaginatedResponse<DocumentDto> listDocuments(String kbId, String keywords, long createTimeFrom,
        long createTimeTo, DocumentListRequest req, String userId, Pageable pageable) {

        List<String> tenantIds = tenantClient.getUserTenants(userId);
        boolean authorized = false;
        for (String tenantId : tenantIds) {
            List<KnowledgebaseDto> kbs = kbClient.queryKbs(Map.of("tenant_id", tenantId, "id", kbId));
            if (kbs != null && !kbs.isEmpty()) {
                authorized = true;
                break;
            }
        }
        if (!authorized) {
            throw new SecurityException("Only owner of dataset authorized for this operation.");
        }

        // 2. Resolve 'return_empty_metadata' flag
        boolean returnEmptyMetadata = req.returnEmptyMetadata();

        // 3. Validate Status and Types
        if (req.runStatus() != null && !req.runStatus().isEmpty()) {
            boolean isValid = req.runStatus().stream().anyMatch(TaskStatus::isValid);
            if (!isValid) {
                throw new IllegalArgumentException("Invalid filter run status conditions: " + String.join(", ", req.runStatus()));
            }
        }

        if (req.types() != null && !req.types().isEmpty()) {
            boolean isValidType = fileClient.isValidFileType(req.types());
            if (!isValidType) {
                throw new IllegalArgumentException("Invalid filter conditions: " + String.join(", ", req.types()) + " type(s)");
            }
        }

        // 4. Handle Metadata logic (Mutable copies)
        Map<String, Object> metadata = req.metadata() == null ? new HashMap<>() : new HashMap<>(req.metadata());
//        Map<String, Object> metadataCondition = new HashMap<>(); // req.metadataCondition() == null ? new HashMap<>() : new HashMap<>(req.metadataCondition());

        if (metadata.containsKey("empty_metadata") && Boolean.TRUE.equals(metadata.get("empty_metadata"))) {
            returnEmptyMetadata = true;
            metadata.remove("empty_metadata");
        }

        if (returnEmptyMetadata) {
//            metadataCondition.clear();
            metadata.clear();
        }

        // 5. Build Metadata Intersections (doc_ids_filter)
//        Set<String> docIdsFilter = null;

//        if (/*!metadataCondition.isEmpty() || */!metadata.isEmpty()) {
//            Map<String, Map<String, List<String>>> metas = getFlattedMetaByKbs(List.of(kbId));

            // Metadata Conditions (Assuming you have a helper method to resolve complex conditions)
//            if (!metadataCondition.isEmpty()) {
//                List<MetadataFilterCondition> metadataFilterConditions = MetadataUtils.convertConditions(metadataCondition);
//                Set<String> filteredSet = MetadataUtils.metaFilter(metas, metadataFilterConditions, metadataCondition.getOrDefault("logic", "and").toString());
//                docIdsFilter = new HashSet<>(filteredSet);
//
//                if (metadataCondition.containsKey("conditions") && docIdsFilter.isEmpty()) {
//                    return PaginatedResponse.of(Collections.emptyList(), Page.empty());
//                }
//            }

            // Direct Metadata Key-Value Match Intersections
//                Set<String> metadataDocIds = null;
//                for (Map.Entry<String, Object> entry : metadata.entrySet()) {
//                    List<?> rawValues = (entry.getValue() instanceof List)
//                            ? (List<?>) entry.getValue()
//                            : Collections.singletonList(entry.getValue());
//
//                    if (rawValues.isEmpty()) continue;
//
//                    Set<String> keyDocIds = new HashSet<>();
//                    for (Object val : rawValues) {
//                        if (val != null && !val.toString().trim().isEmpty()) {
//                            List<String> idsForVal = metas.getOrDefault(entry.getKey(), Collections.emptyMap()).getOrDefault(val.toString(), Collections.emptyList());
//                            keyDocIds.addAll(idsForVal);
//                        }
//                    }
//
//                    if (metadataDocIds == null) {
//                        metadataDocIds = keyDocIds;
//                    } else {
//                        metadataDocIds.retainAll(keyDocIds); // Intersection
//                    }
//
//                    if (metadataDocIds.isEmpty()) {
//                        return PaginatedResponse.of(Collections.emptyList(),Page.empty());
//                    }
//                }
//
//                if (metadataDocIds != null && !metadataDocIds.isEmpty()) {
//                    if (docIdsFilter == null || docIdsFilter.isEmpty()) {
//                        docIdsFilter = metadataDocIds;
//                    } else {
//                        docIdsFilter.retainAll(metadataDocIds); // Final intersection
//                    }
//                    if (docIdsFilter.isEmpty()) {
//                        return PaginatedResponse.of(Collections.emptyList(),Page.empty());
//                    }
//                }
//        }

//        List<String> finalDocIdsFilter = (docIdsFilter != null) ? new ArrayList<>(docIdsFilter) : null;

        Specification<Document> spec = Specification.allOf(DocumentSpecification.hasKbId(kbId))
                .and(DocumentSpecification.nameContainsIgnoreCase(keywords))
                .and(DocumentSpecification.statusIn(req.runStatus()))
                .and(DocumentSpecification.typeIn(req.types()))
                .and(DocumentSpecification.suffixIn(req.suffix()))
                .and(DocumentSpecification.createdAfter(createTimeFrom))
                .and(DocumentSpecification.createdBefore(createTimeTo))
                .and(DocumentSpecification.hasEmptyMetadata(returnEmptyMetadata));

        Page<Document> fetchResponse = documentRepository.findAll(spec, pageable);

        List<Document> docs = fetchResponse.getContent();

        // 8. Post-process thumbnails and source_type
        List<DocumentDto> documentDtos = new ArrayList<>();
        for (Document doc : docs) {

            String thumb = doc.getThumbnail();
            if (thumb!=null && !thumb.startsWith(IMG_BASE64_PREFIX)) {
                doc.setThumbnail("/v1/document/image/" + kbId + "-" + thumb);
            }

            String sourceType = doc.getSourceType();
            if (sourceType!=null) {
                doc.setSourceType(sourceType.split("/")[0]);
            }

            ZonedDateTime zonedDateTime = ZonedDateTime.of(doc.getCreatedTime(), ZoneId.systemDefault());
            long createdTime = zonedDateTime.toInstant().toEpochMilli();

            DocumentDto documentDto = DocumentDto.builder()
                  .id(doc.getId())
                  .chunkNum(doc.getChunkNum())
                  .run(doc.getRun())
                  .progress(doc.getProgress())
                  .tokenNum(doc.getTokenNum())
                  .sourceType(doc.getSourceType())
                  .kbId(doc.getKbId())
                  .location(doc.getLocation())
                  .parserId(doc.getParserId())
                  .pipelineId(doc.getPipelineId())
                  .nickname(doc.getName())
                  .suffix(doc.getSuffix())
                  .createDate(Utility.formatDate(doc.getCreatedTime()))
                  .createTime(createdTime)
                  .build();
            documentDtos.add(documentDto);
        }

        return PaginatedResponse.of(documentDtos, fetchResponse);
    }

    public  Map<String, Map<String, String>> changeDocumentStatus(List<String> docIds, int status, String currentUserId) {
        Map<String, String> result = new HashMap<>();
        Map<String, String> errorMap = new HashMap<>();

        for (String docId : docIds) {
            try {
                // 1. Authorization Check (Equivalent to DocumentService.accessible)
                // 2. Fetch Document
                // 3. Fetch Knowledgebase details
                Optional<Document> documentOptional = documentRepository.findById(docId);
                if (documentOptional.isEmpty()) {
                    errorMap.put(docId, "Document not present");
                    continue;
                }

                Document doc = documentOptional.get();

                List<String> kbIdList = kbClient.accessibleKb(doc.getKbId(), currentUserId);
                if (kbIdList.isEmpty()) {
                    errorMap.put(docId, "Can't find this dataset!");
                    continue;
                }
                if (!documentRepository.existsByKbIdIn(kbIdList)) {
                    result.put(docId, "No authorization.");
                    continue;
                }

                // 4. Skip if status is already correct
                if (status==doc.getStatus()) {
                    result.put(docId, Integer.toString(status));
                    continue;
                }

                // 5. Update Relational Database
                doc.setStatus(status);
                try {
                    documentRepository.save(doc);
                } catch (Exception dbEx) {
                    errorMap.put(docId, "Database error (Document update)!");
                    continue;
                }

                if (doc.getChunkNum() != null && doc.getChunkNum() > 0) {
                    try {

                        boolean ok = ragClient.updateChunkStatus(docId, status, currentUserId, doc.getKbId());

                        if (!ok) {
                            errorMap.put(docId, "Database error (docStore update)!");
                            continue;
                        }
                    } catch (Exception exc) {
                        String msg = exc.getMessage() != null ? exc.getMessage() : "Unknown error";
                        if (msg.contains("3022")) {
                            errorMap.put(docId, "Document store table missing.");
                        } else {
                            errorMap.put(docId, "Document store update failed: " + msg);
                        }
                        continue;
                    }
                }

                // 7. Success for this document
                result.put(docId, Integer.toString(status));

            } catch (Exception e) {
                // Catch-all internal error per doc_id
                errorMap.put(docId, "Internal server error: " + e.getMessage());
            }
        }
        return Map.of("success",result,"error",errorMap);
    }

    public FileDownloadResponse downloadDocument(String docId) {

        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found!"));

        StorageAddressResponse address = getStorageAddress(doc, null);


        return fileClient.downloadFile(address.bucket(), address.objectName());
    }

    private StorageAddressResponse getStorageAddress(Document doc, String fileId) {
        List<File2Document> f2dList;
        String docId = doc.getId();
        // 1. Fetch mapping by doc_id or file_id
        if (StringUtils.hasText(docId)) {
            f2dList = file2DocumentRepository.findByDocumentId(docId);
        } else if (StringUtils.hasText(fileId)) {
            f2dList = file2DocumentRepository.findByFileId(fileId);
        } else {
            f2dList = List.of();
        }

        // 2. If a mapping exists, fetch File from the external microservice
        if (f2dList != null && !f2dList.isEmpty()) {
            File2Document f2d = f2dList.getFirst();

            // Fetch file via Feign Client
            FileResponse file = fileClient.getFileById(f2d.getFileId());
            if (file == null) {
                throw new EntityNotFoundException("File not found in external service for ID: " + f2d.getFileId());
            }

            if (!StringUtils.hasText(file.sourceType()) || "LOCAL".equalsIgnoreCase(file.sourceType())) {
                return new StorageAddressResponse(file.parentId(), file.location());
            }

            // Fallback: update docId from the mapping
            docId = f2d.getDocumentId();
        }

        if (!StringUtils.hasText(docId)) {
            throw new IllegalArgumentException("Please specify docId");
        }

        return new StorageAddressResponse(doc.getKbId(), doc.getLocation());
    }

    public String removeDocument(List<String> documentIds, String userId) throws Exception {
        for (String docId : documentIds) {
            // check for permission
            Document document = documentRepository.findById(docId).get();
            List<String> accessibleKb = tenantClient.accessible4deletion(document.getKbId(), userId);
            boolean accessibleForDeletion = documentRepository.existsByKbIdIn(accessibleKb);
            if(!accessibleForDeletion){
                throw new Exception("No authorization.");
            }
        }

        return fileClient.deleteDocs(documentIds, userId);

    }
}
