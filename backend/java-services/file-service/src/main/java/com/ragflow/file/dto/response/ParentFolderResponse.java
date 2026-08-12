package com.ragflow.file.dto.response;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record ParentFolderResponse(
        UUID id,
        UUID parentId,
        String name,
        String type,
        String location,
        UUID tenantId,
        UUID createBy,
        Long size,
        String sourceType,
        Instant createdAt,
        Instant updatedAt,
        Boolean hasChildFolder
) {
}