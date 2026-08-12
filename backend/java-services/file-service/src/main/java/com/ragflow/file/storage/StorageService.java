package com.ragflow.file.storage;

import io.minio.ObjectWriteResponse;

import java.io.InputStream;

public interface StorageService {

    /**
     * Upload file
     *
     * @return
     */
    void upload(
            String bucket,
            String key,
            InputStream inputStream,
            long contentLength,
            String contentType);

    /**
     * Download file
     */
    InputStream download(
            String bucket,
            String key);

    /**
     * Delete file
     */
    void delete(
            String bucket,
            String key);

    /**
     * Check file exists
     */
    boolean exists(
            String bucket,
            String key);

    void move(

            String sourceBucket,

            String sourceKey,

            String destinationBucket,

            String destinationKey

    );

}
