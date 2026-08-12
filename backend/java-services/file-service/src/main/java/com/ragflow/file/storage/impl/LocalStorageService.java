package com.ragflow.file.storage.impl;

import com.ragflow.file.exception.StorageException;
import com.ragflow.file.storage.StorageProperties;
import com.ragflow.file.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "storage", name = "type", havingValue = "LOCAL", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private final StorageProperties properties;

    @Override
    public void upload(String bucket, String key, InputStream input, long size, String contentType) {
        Path targetPath = resolve(bucket, key);

        try {
            // Ensure parent directories exist (handles nested keys like "folder/subfolder/file.txt")
            Files.createDirectories(targetPath.getParent());

            Files.copy(input, targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Successfully uploaded file to local storage: {}", targetPath);

        } catch (IOException e) {
            log.error("Failed to upload file to local storage. Bucket: {}, Key: {}", bucket, key, e);
            throw new StorageException("Failed to upload file to local storage: " + key, e);
        }
    }

    @Override
    public InputStream download(String bucket, String key) {
        Path path = resolve(bucket, key);

        try {
            return Files.newInputStream(path);
        } catch (IOException e) {
            log.error("Failed to download file from local storage. Bucket: {}, Key: {}", bucket, key, e);
            throw new StorageException("Failed to download file from local storage: " + key, e);
        }
    }

    @Override
    public void delete(String bucket, String key) {
        Path path = resolve(bucket, key);

        try {
            boolean deleted = Files.deleteIfExists(path);
            if (deleted) {
                log.info("Successfully deleted file from local storage: {}", path);
            } else {
                log.warn("File to delete was not found in local storage: {}", path);
            }
        } catch (IOException e) {
            log.error("Failed to delete file from local storage. Bucket: {}, Key: {}", bucket, key, e);
            throw new StorageException("Failed to delete file from local storage: " + key, e);
        }
    }

    @Override
    public boolean exists(String bucket, String key) {
        Path path = resolve(bucket, key);
        return Files.exists(path);
    }

    @Override
    public void move(String sourceBucket, String sourceKey, String destinationBucket, String destinationKey) {
        Path source = resolve(sourceBucket, sourceKey);
        Path destination = resolve(destinationBucket, destinationKey);

        try {
            Files.createDirectories(destination.getParent());

            Files.move(source, destination, StandardCopyOption.REPLACE_EXISTING);

            log.info("Successfully moved file from [{}] to [{}] in local storage", source, destination);

        } catch (IOException e) {
            log.error("Failed to move file from [{}] to [{}] in local storage", source, destination, e);
            throw new StorageException("Failed to move file in local storage", e);
        }
    }

    private Path resolve(String bucket, String key) {
        return Paths.get(properties.getLocal().getPath(), bucket, key);
    }
}