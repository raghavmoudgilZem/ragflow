package com.ragflow.file.service;

import com.ragflow.file.entity.FileEntity;

import java.util.UUID;

public interface FolderService {

    FileEntity getOrCreateRootFolder(UUID tenantId);

    FileEntity findFolder(UUID folderId);

    FileEntity createFolderHierarchy(
            UUID parentId,
            String[] folders,
            UUID tenantId);

    void deleteFolderRecursively(
            FileEntity folder,
            UUID userId
    );

}
