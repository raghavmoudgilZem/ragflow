package com.ragflow.file.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.util.UUID;

@Builder
public record UploadFileResponse(

        UUID id,

        @JsonProperty("parent_id")
        UUID parentId,

        @JsonProperty("tenant_id")
        UUID tenantId,

        @JsonProperty("created_by")
        UUID createdBy,

        String name,

        String location,

        Long size,

        String type

) {}
