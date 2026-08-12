package com.rag.notification.dto.request;

import jakarta.validation.constraints.NotNull;

public record UpdateTemplateStatusRequest(
        @NotNull(message = "status is required")
        Boolean status
) {}