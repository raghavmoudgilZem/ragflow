package com.ragflow.file.service;

import com.ragflow.file.entity.FileEntity;

import java.util.UUID;

public interface PermissionService {
    boolean hasPermission(FileEntity file,UUID userId);
}
