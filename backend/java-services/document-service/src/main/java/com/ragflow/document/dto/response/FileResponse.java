package com.ragflow.document.dto.response;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record FileResponse(
        String id,

        @JsonProperty("parent_id")
        String parentId,

        @JsonProperty("tenant_id")
        String tenantId,

        @JsonProperty("created_by")
        String createdBy,

        String name,

        String type,

        Long size,

        String location,

        @JsonProperty("source_type")
        String sourceType
) {}
