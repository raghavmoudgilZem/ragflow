package com.ragflow.file.storage.impl;

import com.ragflow.file.exception.StorageException;
import com.ragflow.file.storage.StorageProperties;
import com.ragflow.file.storage.StorageService;
import io.minio.*;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "storage", name = "type", havingValue = "MINIO")
public class MinioStorageService implements StorageService {

    private final MinioClient client;
    private final StorageProperties properties;

    @Override
    public void upload(String folderId, String filename, InputStream input, long size, String contentType) {
        String objectKey = buildObjectKey(folderId, filename);
        String bucket = getBucketName();

        try {
            ObjectWriteResponse response = client.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectKey)
                            .stream(input, size, -1)
                            .contentType(contentType)
                            .build()
            );

            log.info("Successfully uploaded object to MinIO. Bucket: {}, Object: {}, ETag: {}",
                    response.bucket(), response.object(), response.etag());

        } catch (MinioException | IOException | GeneralSecurityException e) {
            log.error("Failed to upload file [{}] to folder [{}] in MinIO", filename, folderId, e);
            throw new StorageException("Failed to upload file to storage: " + filename, e);
        }
    }

    @Override
    public InputStream download(String folderId, String filename) {
        String objectKey = buildObjectKey(folderId, filename);
        String bucket = getBucketName();

        try {
            return client.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectKey)
                            .build()
            );
        } catch (MinioException | IOException | GeneralSecurityException e) {
            log.error("Failed to download file [{}] from folder [{}] in MinIO", filename, folderId, e);
            throw new StorageException("Failed to download file from storage: " + filename, e);
        }
    }

    @Override
    public void delete(String folderId, String filename) {
        String objectKey = buildObjectKey(folderId, filename);
        String bucket = getBucketName();

        try {
            client.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectKey)
                            .build()
            );
            log.info("Successfully deleted object [{}] from bucket [{}]", objectKey, bucket);
        } catch (MinioException | IOException | GeneralSecurityException e) {
            log.error("Failed to delete file [{}] from folder [{}] in MinIO", filename, folderId, e);
            throw new StorageException("Failed to delete file from storage: " + filename, e);
        }
    }

    @Override
    public boolean exists(String folderId, String filename) {
        String objectKey = buildObjectKey(folderId, filename);
        String bucket = getBucketName();

        try {
            client.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectKey)
                            .build()
            );
            return true;
        } catch (ErrorResponseException e) {
            // MinIO throws ErrorResponseException with code "NoSuchKey" or "NoSuchBucket" if object isn't present
            if ("NoSuchKey".equals(e.errorResponse().code()) || "NoSuchBucket".equals(e.errorResponse().code())) {
                return false;
            }
            log.error("Error checking existence for file [{}] in folder [{}]", filename, folderId, e);
            throw new StorageException("Failed to check file existence in storage", e);
        } catch (MinioException | IOException | GeneralSecurityException e) {
            log.error("Unexpected error checking file existence for [{}]", objectKey, e);
            throw new StorageException("Storage error occurred while checking file existence", e);
        }
    }

    @Override
    public void move(String sourceFolder, String sourceFile, String destinationFolder, String destinationFile) {
        String bucket = getBucketName();
        String sourceKey = buildObjectKey(sourceFolder, sourceFile);
        String destKey = buildObjectKey(destinationFolder, destinationFile);

        try {
            client.copyObject(
                    CopyObjectArgs.builder()
                            .bucket(bucket)
                            .object(destKey)
                            .source(CopySource.builder().bucket(bucket).object(sourceKey).build())
                            .build()
            );

            delete(sourceFolder, sourceFile);
            log.info("Successfully moved object from [{}] to [{}]", sourceKey, destKey);

        } catch (MinioException | IOException | GeneralSecurityException e) {
            log.error("Failed to move file from [{}] to [{}] in MinIO", sourceKey, destKey, e);
            throw new StorageException("Failed to move file in storage", e);
        }
    }

    private String buildObjectKey(String folderId, String filename) {
        return folderId + "/" + filename;
    }

    private String getBucketName() {
        return properties.getMinio().getBucket();
    }
}