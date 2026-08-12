package com.ragflow.document.dto.response;

import java.util.List;

public record FileUploadResponse(
        List<String> errors,
        List<String> files
) {}
