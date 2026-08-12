package com.ragflow.document.dto.response;

public record StorageAddressResponse (
        String bucket,
        String objectName
) {}
