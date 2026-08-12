package com.ragflow.document.dto.response;

public record FileGetResponse(
        boolean error,
        FileResponse file
) {}