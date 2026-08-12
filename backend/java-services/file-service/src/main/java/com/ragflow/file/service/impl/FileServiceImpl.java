package com.ragflow.file.service.impl;

import com.ragflow.file.dto.request.CreateFolderRequest;
import com.ragflow.file.dto.request.UploadRequest;
import com.ragflow.file.dto.response.FileListResponse;
import com.ragflow.file.dto.response.FileResponse;
import com.ragflow.file.dto.response.ParentFolderResponse;
import com.ragflow.file.dto.response.UploadFileResponse;
import com.ragflow.file.entity.FileEntity;
import com.ragflow.file.enums.FileType;
import com.ragflow.file.exception.DuplicateFolderException;
import com.ragflow.file.exception.FolderNotFoundException;
import com.ragflow.file.exception.ParentFolderNotFoundException;
import com.ragflow.file.exception.StorageException;
import com.ragflow.file.mapper.FileMapper;
import com.ragflow.file.repository.FileRepository;
import com.ragflow.file.security.RequestContext;
import com.ragflow.file.service.FileDeletionService;
import com.ragflow.file.service.FileService;
import com.ragflow.file.service.FolderService;
import com.ragflow.file.service.PermissionService;
import com.ragflow.file.storage.StorageFactory;
import com.ragflow.file.storage.StorageProperties;
import com.ragflow.file.storage.StorageService;
import com.ragflow.file.utils.FileTypeDetector;
import com.ragflow.file.utils.MimeTypeUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.jspecify.annotations.NonNull;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.*;

import static com.ragflow.file.utils.CommonConstants.KNOWLEDGEBASE_FOLDER;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileServiceImpl implements FileService {

    private final FileRepository repository;
    private final StorageService storageService;
    private final StorageProperties properties;
    private final PermissionService permissionService;
    private final FileDeletionService fileDeletionService;
    private final FolderService folderService;
    private final FileMapper fileMapper;
    private final StorageFactory storageFactory;

    @Override
    public FileResponse create(CreateFolderRequest request) {

        UUID parentId = request.parent_id();
        UUID tenantId = RequestContext.getTenantId();

        if (parentId == null) {
            FileEntity rootFolder = getOrCreateRootFolder();
            parentId = rootFolder.getId();
            log.info("Parent assigned to new folder {}", parentId);
        }

        if (!repository.existsById(parentId)) {
            throw new ParentFolderNotFoundException("Parent Folder Doesn't Exist!");
        }

        if (repository.existsByParentIdAndName(parentId, request.name())) {
            throw new DuplicateFolderException("Duplicated folder name in the same folder.");
        }

        String type = FileType.FOLDER.getValue().equalsIgnoreCase(request.type()) ? FileType.FOLDER.getValue() : FileType.VIRTUAL.getValue();

        FileEntity entity = FileEntity.builder().id(UUID.randomUUID()).parentId(parentId).tenantId(tenantId).createdBy(tenantId).name(request.name()).location("").size(0L).type(type).createdAt(Instant.now()).updatedAt(Instant.now()).hasChildFolder(false).build();

        repository.save(entity);

        Optional<FileEntity> root = repository.findById(parentId);

        if (root.isPresent()) {
//            root.get().setSize(root.get().getSize() + 1);
            root.get().setHasChildFolder(Boolean.TRUE);
            repository.save(root.get());
        }


        return FileResponse.builder().id(entity.getId()).parentId(parentId).tenantId(tenantId).createdBy(tenantId).name(request.name()).location("").size(0L).type(type).createdAt(Instant.now()).updatedAt(Instant.now()).hasChildFolder(false).build();

    }


    @Override
    @Transactional
    public List<UploadFileResponse> uploadFiles(UploadRequest request) {

        UUID parentId = request.parent_id();
        UUID tenantId = RequestContext.getTenantId();

        List<MultipartFile> multipartFiles = request.file();

        if (parentId == null) {
            parentId = getOrCreateRootFolder().getId();
        }

        FileEntity parentFolder = repository.findById(parentId).orElseThrow(() -> new ParentFolderNotFoundException("Parent folder doesn't exist"));

        List<UploadFileResponse> responses = new ArrayList<>();

        for (MultipartFile multipartFile : multipartFiles) {

            responses.add(uploadSingleFile(parentFolder, multipartFile));
        }

        return responses;
    }

    private UploadFileResponse uploadSingleFile(FileEntity parentFolder, MultipartFile multipartFile) {

        UUID tenantId = RequestContext.getTenantId();

        try {

            String[] parts = getParts(multipartFile);

            FileEntity lastFolder = createFolderHierarchy(parentFolder, parts);

            String filename = parts[parts.length - 1];

            String storageName = filename;

            while (storageService.exists(lastFolder.getId().toString(), storageName)) {
                storageName += "_";
            }

            byte[] bytes = multipartFile.getBytes();
            storageService.upload(lastFolder.getId().toString(),      // bucket/folder
                    storageName,                        // object key
                    multipartFile.getInputStream(), multipartFile.getSize(), multipartFile.getContentType());

            String databaseName = duplicateFileName(lastFolder.getId(), filename);

            FileEntity entity = FileEntity.builder().id(UUID.randomUUID()).parentId(lastFolder.getId()).tenantId(tenantId).createdBy(tenantId).name(databaseName).location(storageName).size((long) bytes.length).type(FileTypeDetector.detect(filename)).createdAt(Instant.now()).updatedAt(Instant.now()).hasChildFolder(false).sourceType(FileTypeDetector.detect(filename)).storageProvider(String.valueOf(properties.getType())).storageBucket(storageFactory.getBucket()).storageFilename(databaseName).storageKey(storageName).build();

            repository.save(entity);

            return UploadFileResponse.builder().id(entity.getId()).parentId(entity.getParentId()).tenantId(entity.getTenantId()).createdBy(entity.getCreatedBy()).name(entity.getName()).location(entity.getLocation()).size(entity.getSize()).type(entity.getType()).build();

        } catch (IOException ex) {
            throw new StorageException("Failed to upload file to storage: " + multipartFile.getOriginalFilename(), ex);
        }
    }

    private static String @NonNull [] getParts(MultipartFile multipartFile) {
        String originalPath = multipartFile.getOriginalFilename();

        if (StringUtils.isBlank(originalPath)) {
            throw new IllegalArgumentException("Filename cannot be empty");
        }

        /*
         * Supports uploading:
         *
         * abc.pdf
         * docs/java/test.pdf
         * images/2024/logo.png
         */

        String normalized = originalPath.replace("\\", "/");

        return normalized.split("/");
    }

    /**
     * Creates folders recursively if missing.
     */
    private FileEntity createFolderHierarchy(FileEntity root, String[] path) {

        FileEntity current = root;

        UUID tenantId = RequestContext.getTenantId();

        /*
         * Ignore last element because it is filename.
         */

        for (int i = 0; i < path.length - 1; i++) {

            String folderName = path[i];
            FileEntity finalCurrent = current;
            Optional<FileEntity> folder = repository.findAllByParentIdAndNameAndType(finalCurrent.getId(), folderName, FileType.FOLDER.getValue()).stream().filter(f -> Objects.equals(f.getParentId(), finalCurrent.getId()) && folderName.equals(f.getName()) && FileType.FOLDER.getValue().equals(f.getType())).findFirst();

            if (folder.isPresent()) {
                current = folder.get();
            } else {

                FileEntity newFolder = FileEntity.builder().id(UUID.randomUUID()).parentId(current.getId()).tenantId(tenantId).createdBy(tenantId).name(folderName).location("").size(0L).type(FileType.FOLDER.getValue()).hasChildFolder(false).createdAt(Instant.now()).updatedAt(Instant.now()).build();

                repository.save(newFolder);

                current = newFolder;
            }
        }

        return current;
    }

    private String duplicateFileName(UUID parentId, String filename) {

        if (!repository.existsByParentIdAndName(parentId, filename)) {

            return filename;
        }

        int count = 1;

        int dot = filename.lastIndexOf(".");

        String base = dot > 0 ? filename.substring(0, dot) : filename;

        String ext = dot > 0 ? filename.substring(dot) : "";

        while (true) {

            String newName = base + "(" + count + ")" + ext;

            if (!repository.existsByParentIdAndName(parentId, newName)) {

                return newName;
            }

            count++;
        }

    }


    private FileEntity getOrCreateRootFolder() {

        UUID tenantId = RequestContext.getTenantId();

        Optional<FileEntity> root = repository.findByTenantIdAndParentId(tenantId, tenantId);

        if (root.isPresent()) {
            return root.get();
        }

        UUID rootId = UUID.randomUUID();

        FileEntity entity = FileEntity.builder().id(rootId).parentId(rootId).tenantId(tenantId).createdBy(tenantId).name("/").location("").size(0L).type(FileType.FOLDER.getValue()).hasChildFolder(true).createdAt(Instant.now()).updatedAt(Instant.now()).build();

        return repository.save(entity);
    }


    @Override
    @Transactional
    public void deleteFiles(List<UUID> fileIds) {}


    @Override
    public void rename(UUID fileId, String newName) {}

    @Override
    @Transactional
    public void move(List<UUID> sourceIds, UUID destinationId) {}


    @Override
    public ResponseEntity<Resource> download(UUID fileId) {
        return buildResponse(new FileEntity(), new byte[]{});
    }

    private ResponseEntity<Resource> buildResponse(FileEntity file, byte[] content) {

        Resource resource = new ByteArrayResource(content);

        MediaType mediaType = MimeTypeUtil.getMediaType(file.getName());

        return ResponseEntity.ok()

                .contentType(mediaType)

                .contentLength(content.length)

                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")

                .body(resource);

    }


    @Override
    public FileListResponse listFiles(UUID parentId, String keywords, Integer page, Integer pageSize, String orderBy, Boolean desc) {

        //----------------------------------------------------------
        // Get root folder if parentId is null
        //----------------------------------------------------------

        UUID tenantId = RequestContext.getTenantId();

        if (parentId == null) {

            FileEntity root = getOrCreateRootFolder();

            parentId = root.getId();

            initKnowledgebaseDocs(parentId);
        }

        //----------------------------------------------------------
        // Folder exists?
        //----------------------------------------------------------

        Optional<List<FileEntity>> folder = repository.findAllByParentId(parentId);

        if (folder.isPresent()) {

            //----------------------------------------------------------
            // Sorting
            //----------------------------------------------------------

            Sort.Direction direction = Boolean.TRUE.equals(desc) ? Sort.Direction.DESC : Sort.Direction.ASC;

            Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(direction, orderBy));

            //----------------------------------------------------------
            // Search
            //----------------------------------------------------------

            Page<FileEntity> result;

            if (keywords != null && !keywords.isBlank()) {

                result = repository.searchFiles(tenantId, parentId, keywords, pageable);

            } else {

                result = repository.listFiles(tenantId, parentId, pageable);

            }

            //----------------------------------------------------------
            // Convert entities
            //----------------------------------------------------------

            List<FileResponse> responses = new ArrayList<>();

            for (FileEntity entity : result.getContent()) {

                responses.add(fileMapper.ToFileResponse(entity));

            }

            //----------------------------------------------------------
            // Parent folder
            //----------------------------------------------------------

            FileEntity parentFolder = repository.getParentFolder(parentId).orElseThrow(() -> new FolderNotFoundException("Parent folder not found"));


            //----------------------------------------------------------
            // Response
            //----------------------------------------------------------

            return FileListResponse.builder()

                    .total(result.getTotalElements())

                    .files(responses)

                    .parentFolder(ParentFolderResponse.builder().id(parentFolder.getId()).parentId(parentFolder.getParentId()).name(parentFolder.getName()).type(parentFolder.getType()).location(parentFolder.getLocation()).createBy(parentFolder.getCreatedBy()).size(parentFolder.getSize()).updatedAt(parentFolder.getUpdatedAt()).tenantId(parentFolder.getTenantId()).sourceType(parentFolder.getSourceType()).createdAt(parentFolder.getCreatedAt()).hasChildFolder(parentFolder.getHasChildFolder()).build())

                    .build();

        }

        return new FileListResponse(0L, List.of(), ParentFolderResponse.builder().build());
    }

    private void initKnowledgebaseDocs(UUID rootId) {


        Optional<FileEntity> folder = repository.findAllByParentIdAndName(rootId, KNOWLEDGEBASE_FOLDER);

        if (folder.isPresent()) {
            return;
        }

        FileEntity knowledgeFolder = FileEntity.builder()

                .id(UUID.randomUUID())

                .parentId(rootId)

                .tenantId(RequestContext.getTenantId())

                .createdBy(RequestContext.getTenantId())

                .name(KNOWLEDGEBASE_FOLDER)

                .location("")

                .size(0L)

                .type("folder")

                .hasChildFolder(false)

                .build();

        knowledgeFolder = repository.save(knowledgeFolder);

        //----------------------------------------------------
        // Every KB becomes a folder
        //----------------------------------------------------

//        List<KnowledgebaseEntity> knowledgebases =
//                knowledgebaseService.findAllByTenantId(
//                        tenantId);
//
//        for (KnowledgebaseEntity kb : knowledgebases) {
//
//            FileEntity kbFolder =
//                    FileEntity.builder()
//
//                            .id(UUID.randomUUID())
//
//                            .parentId(knowledgeFolder.getId())
//
//                            .tenantId(tenantId)
//
//                            .createdBy(tenantId)
//
//                            .name(kb.getName())
//
//                            .location("")
//
//                            .size(0L)
//
//                            .type("folder")
//
//                            .hasChildFolder(false)
//
//                            .build();
//
//            kbFolder = repository.save(kbFolder);
//
//            //------------------------------------------------
//            // Add documents
//            //------------------------------------------------
//
//            List<DocumentEntity> documents =
//                    documentService.findByKbId(
//                            kb.getId());
//
//            for (DocumentEntity document : documents) {
//
//                addFileFromKnowledgebase(
//                        document,
//                        kbFolder.getId(),
//                        tenantId);
//
//            }
//
//        }

    }

//    private void addFileFromKnowledgebase(
//            DocumentEntity document,
//            UUID parentId,
//            UUID tenantId) {
//
//        FileEntity entity =
//                FileEntity.builder()
//
//                        .id(UUID.randomUUID())
//
//                        .parentId(parentId)
//
//                        .tenantId(tenantId)
//
//                        .createdBy(tenantId)
//
//                        .name(document.getName())
//
//                        .location(document.getName())
//
//                        .size(document.getSize())
//
//                        .type(document.getType())
//
//                        .sourceType("knowledgebase")
//
//                        .hasChildFolder(false)
//
//                        .build();
//
//        repository.save(entity);
//
//    }
}
