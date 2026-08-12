package com.ragflow.file.dto.response;

import com.ragflow.file.entity.KbInfo;
import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record FileResponse(
        UUID id,
        UUID parentId,
        UUID tenantId,
        UUID createdBy,
        String name,
        String location,
        Long size,
        String type,
        Instant createdAt,
        Instant updatedAt,
        Boolean hasChildFolder,
        List<KbInfo> kbsInfo
) {
}