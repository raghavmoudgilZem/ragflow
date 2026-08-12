package com.rag.notification.dto.response;

import java.time.LocalDateTime;

public record TemplateResponse(
        Long templateId,
        String templateName,
        String templateSlug,
        String subject,
        String body,
        Integer version,
        Boolean status,
        LocalDateTime createdAt
) {}