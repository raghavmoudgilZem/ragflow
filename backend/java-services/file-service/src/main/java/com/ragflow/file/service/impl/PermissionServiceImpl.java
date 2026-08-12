package com.ragflow.file.service.impl;

import com.ragflow.file.entity.FileEntity;
import com.ragflow.file.service.PermissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class PermissionServiceImpl implements PermissionService {

    @Override
    public boolean hasPermission(FileEntity file, UUID userId) {

        // Defensive check: deny access if arguments are missing instead of throwing NPE
        if (file == null || userId == null) {
            log.warn("Permission check failed due to null parameter. File: {}, UserId: {}", file, userId);
            return false;
        }

        /*
         * Owner/Creator check using null-safe Objects.equals
         */
        boolean isTenantOwner = Objects.equals(file.getTenantId(), userId);
        boolean isCreator = Objects.equals(file.getCreatedBy(), userId);

        return isTenantOwner || isCreator;
    }
}