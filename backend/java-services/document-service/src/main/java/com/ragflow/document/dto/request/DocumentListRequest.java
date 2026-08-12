package com.ragflow.document.dto.request;

import java.util.List;
import java.util.Map;

public record DocumentListRequest(
        boolean returnEmptyMetadata,
        List<String> runStatus,
        List<String> types,
        List<String> suffix,
        Map<String, Object> metadata
) {}