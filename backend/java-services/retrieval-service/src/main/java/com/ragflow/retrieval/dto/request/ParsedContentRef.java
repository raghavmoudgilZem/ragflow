package com.ragflow.retrieval.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Where a document's already-parsed content sits in object storage.
 *
 * @param storageType backend holding the object; only {@code MINIO} is wired up
 * @param bucket      bucket the object lives in
 * @param objectKey   key of the parsed content within that bucket
 */
public record ParsedContentRef(

        @NotBlank(message = "parsedContentRef.storageType is required")
        String storageType,

        @NotBlank(message = "parsedContentRef.bucket is required")
        String bucket,

        @NotBlank(message = "parsedContentRef.objectKey is required")
        String objectKey) {
}
