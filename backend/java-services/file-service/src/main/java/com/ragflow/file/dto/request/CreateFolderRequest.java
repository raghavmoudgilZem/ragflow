package com.ragflow.file.dto.request;

import lombok.Builder;

import java.util.UUID;

@Builder
public record CreateFolderRequest(
        String name,
        UUID parent_id,
        String type
) {}
