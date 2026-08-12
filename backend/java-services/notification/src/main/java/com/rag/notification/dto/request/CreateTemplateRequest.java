package com.rag.notification.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTemplateRequest(
        @NotBlank(message = "templateName is required")
        String templateName,

        @NotBlank(message = "templateSlug is required")
        String templateSlug,

        @NotBlank(message = "subject is required")
        String subject,

        @NotBlank(message = "body is required")
        String body,

        @NotNull(message = "status is required")
        Boolean status
) {}
