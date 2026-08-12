package com.ragflow.document.dto.request;

public record InitializeKbFolderRequest (
        String userId,
        String tenantId,
        String kbName
){}