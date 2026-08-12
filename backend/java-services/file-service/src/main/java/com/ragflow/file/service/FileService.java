package com.ragflow.file.service;

import com.ragflow.file.dto.request.CreateFolderRequest;
import com.ragflow.file.dto.request.UploadRequest;
import com.ragflow.file.dto.response.FileListResponse;
import com.ragflow.file.dto.response.FileResponse;
import com.ragflow.file.dto.response.UploadFileResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

public interface FileService {

    FileResponse create(CreateFolderRequest request);

    List<UploadFileResponse> uploadFiles(UploadRequest request);

    void deleteFiles(List<UUID> fileIds);

    void rename(UUID fileId, String newName);

    void move(List<UUID> sourceIds, UUID destinationId);

    ResponseEntity<Resource> download(UUID fileId);

    FileListResponse listFiles(UUID parentId, String keywords, Integer page, Integer pageSize, String orderBy, Boolean desc);
}
