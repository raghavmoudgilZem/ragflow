package com.ragflow.document.dto.response;

public record UploadStorageResponse(
        String fileName,
        String fileType,
        String location,
        int size,
        String thumbnailLocation,
        String parser_id
) {}
