package com.ragflow.document.controller;

import com.ragflow.document.dto.DocumentDto;
import com.ragflow.document.dto.request.ChangeStatusRequest;
import com.ragflow.document.dto.request.DocumentCreateRequest;
import com.ragflow.document.dto.request.DocumentListRequest;
import com.ragflow.document.dto.response.ApiResponse;
import com.ragflow.document.dto.response.FileDownloadResponse;
import com.ragflow.document.dto.response.FileUploadResponse;
import com.ragflow.document.dto.response.PaginatedResponse;
import com.ragflow.document.service.DocumentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/document")
@RequiredArgsConstructor
public class DocumentController {

    private static final int FILE_NAME_LEN_LIMIT = 255;

    private final DocumentService documentService;

    @PostMapping("/v1/create")
    public ResponseEntity<ApiResponse<Void>> createDocument(
            @Valid @RequestBody DocumentCreateRequest request,
            @RequestHeader("X-User-Id") String currentUserId
    ) {

        documentService.createDocument(request, currentUserId);
        return ApiResponse.success();
    }

    @PostMapping(value = "/v1/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileUploadResponse>> upload(
            @NotBlank(message = "Lack of KB ID") @RequestParam(value = "kb_id") String kbId,
            @NotNull(message = "No file part") @RequestParam(value = "file") List<MultipartFile> files,
            @RequestHeader("X-User-Id") String currentUserId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantId) {

        // File specifics validation
        for (MultipartFile file : files) {
            String fileName = file.getOriginalFilename();
            if (file.isEmpty() || fileName == null || fileName.isBlank()) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "No file selected!");
            }
            if (fileName.getBytes(StandardCharsets.UTF_8).length > FILE_NAME_LEN_LIMIT) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "File name must be " + FILE_NAME_LEN_LIMIT + " bytes or less.");
            }
        }

        FileUploadResponse uploadResponse = documentService.processFileUpload(kbId, files, currentUserId);

        return ApiResponse.success(uploadResponse);
    }


    @PostMapping("/v1/list")
    public ResponseEntity<ApiResponse<PaginatedResponse<DocumentDto>>> listDocs(
            @NotBlank(message = "Lack of KB ID") @RequestParam(value = "kb_id") String kbId,
            @RequestParam(value = "keywords", defaultValue = "") String keywords,
            @RequestParam(value = "page", defaultValue = "1") int pageNumber,
            @RequestParam(value = "page_size", defaultValue = "10") int itemsPerPage,
            @RequestParam(value = "create_time_from", defaultValue = "0") long createTimeFrom,
            @RequestParam(value = "create_time_to", defaultValue = "0") long createTimeTo,
            @RequestBody(required = false) DocumentListRequest requestBody,
            @RequestHeader("X-User-Id") String currentUserId
    ) {

        // Initialize empty request if body is omitted
        if (requestBody == null) {
            requestBody = new DocumentListRequest(false, null, null, null, null);
        }

        PageRequest pageable = PageRequest.of(pageNumber - 1, itemsPerPage, Sort.by("createdTime").ascending());

        PaginatedResponse<DocumentDto> response = documentService.listDocuments(
                kbId, keywords, createTimeFrom, createTimeTo, requestBody, currentUserId, pageable
        );
        return ApiResponse.success(response);
    }


    @PostMapping("/v1/change_status")
    public ResponseEntity<ApiResponse<Map<String, Map<String, String>>>> changeStatus(
            @Valid @RequestBody ChangeStatusRequest req,
            @RequestHeader("X-User-Id") String currentUserId) {

        Map<String, Map<String, String>> result = documentService.changeDocumentStatus(req.docIds(), req.status(), currentUserId);
        if (result.values().stream().anyMatch(v -> v.get("error")!=null)) {
            return ApiResponse.error(HttpStatus.PARTIAL_CONTENT,"Partial failure", result);
        }
        return ApiResponse.success(result);
    }

    @DeleteMapping("/v1/remove")
    public ResponseEntity<ApiResponse<Void>> removeDocument(@RequestBody List<String> documentIds, @RequestHeader("X-User-Id") String userId) throws Exception {
        String errorMsg = documentService.removeDocument(documentIds, userId);
        if (StringUtils.isNotBlank(errorMsg)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, errorMsg);
        }
        return ApiResponse.success();
    }

    @GetMapping("/v1/get/{docId}")
    public ResponseEntity<Resource> getDocument(@PathVariable String docId) {

        FileDownloadResponse downloadResult = documentService.downloadDocument(docId);

        InputStreamResource resource =
                new InputStreamResource(downloadResult.inputStream());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType(downloadResult.contentType())
        );
        headers.setContentLength(downloadResult.contentLength());
        headers.setContentDisposition(
                ContentDisposition.inline()
                        .filename(downloadResult.fileName())
                        .build()
        );
        headers.setCacheControl(CacheControl.noCache());

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(resource);
    }

}