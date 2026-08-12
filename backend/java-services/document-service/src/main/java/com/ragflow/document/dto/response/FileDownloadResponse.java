package com.ragflow.document.dto.response;

import java.io.InputStream;

public record FileDownloadResponse(
        InputStream inputStream,
        long contentLength,
        String contentType,
        String fileName
) {}