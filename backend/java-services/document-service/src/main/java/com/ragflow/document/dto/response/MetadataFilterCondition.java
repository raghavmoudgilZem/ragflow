package com.ragflow.document.dto.response;

public record MetadataFilterCondition(
        String key,
        String operator,
        Object value
) {}
