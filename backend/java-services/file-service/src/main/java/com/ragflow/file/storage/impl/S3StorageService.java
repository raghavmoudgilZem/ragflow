package com.ragflow.file.storage.impl;

import com.ragflow.file.exception.StorageException;
import com.ragflow.file.storage.StorageProperties;
import com.ragflow.file.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.InputStream;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(
        prefix = "storage",
        name = "type",
        havingValue = "S3")
public class S3StorageService implements StorageService {

    private final S3Client client;
    private final StorageProperties properties;

    @Override
    public void upload(
            String bucket,
            String key,
            InputStream input,
            long size,
            String contentType) {

        try {
            client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromInputStream(input, size)
            );

            log.info("Successfully uploaded file to S3. Bucket: {}, Key: {}", bucket, key);

        } catch (SdkException e) {
            log.error("Failed to upload file to S3. Bucket: {}, Key: {}", bucket, key, e);
            throw new StorageException("Failed to upload file to S3 storage: " + key, e);
        }
    }

    @Override
    public InputStream download(
            String bucket,
            String key) {

        try {
            return client.getObject(
                    GetObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build());

        } catch (NoSuchKeyException e) {
            log.error("File not found in S3. Bucket: {}, Key: {}", bucket, key, e);
            throw new StorageException("File not found in S3 storage: " + key, e);

        } catch (SdkException e) {
            log.error("Failed to download file from S3. Bucket: {}, Key: {}", bucket, key, e);
            throw new StorageException("Failed to download file from S3 storage: " + key, e);
        }
    }

    @Override
    public void delete(
            String bucket,
            String key) {

        try {
            client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build());

            log.info("Successfully deleted file from S3. Bucket: {}, Key: {}", bucket, key);

        } catch (SdkException e) {
            log.error("Failed to delete file from S3. Bucket: {}, Key: {}", bucket, key, e);
            throw new StorageException("Failed to delete file from S3 storage: " + key, e);
        }
    }

    @Override
    public boolean exists(
            String bucket,
            String key) {

        try {
            client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build());
            return true;

        } catch (NoSuchKeyException e) {
            return false;

        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                return false;
            }
            log.error("Error checking existence for file [{}] in S3 bucket [{}]", key, bucket, e);
            throw new StorageException("Failed to check file existence in S3 storage", e);

        } catch (SdkException e) {
            log.error("Unexpected error checking existence for file [{}] in S3", key, e);
            throw new StorageException("Failed to check file existence in S3 storage", e);
        }
    }

    @Override
    public void move(
            String sourceBucket,
            String sourceKey,
            String destinationBucket,
            String destinationKey) {

        String mainBucket = properties.getS3().getBucket();
        String source = mainBucket + "/" + sourceBucket + "/" + sourceKey;
        String destKey = destinationBucket + "/" + destinationKey;

        try {
            CopyObjectRequest copyRequest = CopyObjectRequest.builder()
                    .copySource(source)
                    .bucket(mainBucket)
                    .key(destKey)
                    .build();

            client.copyObject(copyRequest);

            delete(sourceBucket, sourceKey);

            log.info("Successfully moved object from [{}] to [{}] in S3", source, destKey);

        } catch (SdkException e) {
            log.error("Failed to move file in S3 from [{}] to [{}]", source, destKey, e);
            throw new StorageException("Failed to move file in S3 storage", e);
        }
    }
}