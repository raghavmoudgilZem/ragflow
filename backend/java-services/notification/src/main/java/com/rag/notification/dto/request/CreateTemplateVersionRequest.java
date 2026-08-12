package com.rag.notification.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateTemplateVersionRequest(
        @NotBlank(message = "subject is required")
        String subject,

        @NotBlank(message = "body is required")
        String body
) {}