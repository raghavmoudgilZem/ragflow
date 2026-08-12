package com.ragflow.file.controller;

import com.ragflow.file.dto.request.*;
import com.ragflow.file.dto.response.ApiResponse;
import com.ragflow.file.dto.response.FileListResponse;
import com.ragflow.file.dto.response.FileResponse;
import com.ragflow.file.dto.response.UploadFileResponse;
import com.ragflow.file.service.FileService;
import com.ragflow.file.utils.CommonConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(CommonConstants.BASE_URL)
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<FileResponse>> create(@Valid @RequestBody CreateFolderRequest request) {
        FileResponse file = fileService.create(request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.CREATED.value(), file));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<UploadFileResponse>>> upload(@Valid @ModelAttribute UploadRequest request) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), fileService.uploadFiles(request)));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<FileListResponse>> listFiles(
            @RequestParam(required = false, value = "parent_id") UUID parentId,
            @RequestParam(defaultValue = "") String keywords,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "50") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String orderBy,
            @RequestParam(defaultValue = "true") Boolean desc) {

        if (page < 1) {
            throw new IllegalArgumentException("page must be greater than 0");
        }

        if (pageSize < 1 || pageSize > 500) {
            throw new IllegalArgumentException("page_size must be between 1 and 500");
        }

        FileListResponse response = fileService.listFiles(parentId, keywords, page, pageSize, orderBy, desc);

        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), response));
    }

    @PostMapping("/remove")
    public ResponseEntity<ApiResponse<Boolean>> deleteFiles(@Valid @RequestBody DeleteFileRequest request) {
        fileService.deleteFiles(request.fileIds());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), true));
    }

    @PostMapping("/rename")
    public ResponseEntity<ApiResponse<Boolean>> renameFile(@Valid @RequestBody RenameFileRequest request) {
        fileService.rename(request.fileId(), request.name());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), true));
    }

    @PostMapping("/move")
    public ResponseEntity<ApiResponse<Boolean>> move(@Valid @RequestBody MoveFileRequest request) {
        fileService.move(request.srcFileIds(), request.destFileId());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), true));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Resource> download(@PathVariable UUID id) {
        return fileService.download(id);
    }
}
