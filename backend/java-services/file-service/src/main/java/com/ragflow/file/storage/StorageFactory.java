package com.ragflow.file.storage;

import com.ragflow.file.storage.impl.LocalStorageService;
import com.ragflow.file.storage.impl.MinioStorageService;
import com.ragflow.file.storage.impl.S3StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StorageFactory {

    //    Using ObjectProvider prevents Spring from requiring beans that aren't active.
    private final ObjectProvider<LocalStorageService> localProvider;
    private final ObjectProvider<S3StorageService> s3Provider;
    private final ObjectProvider<MinioStorageService> minioProvider;

    private final StorageProperties properties;

    public StorageService get() {

        return switch (properties.getType()) {

            case LOCAL -> localProvider.getObject();

            case S3 -> s3Provider.getObject();

            case MINIO -> minioProvider.getObject();
        };
    }

    public String getBucket() {
        return switch (properties.getType()) {

            case LOCAL -> properties.getLocal().getPath();

            case S3 -> properties.getS3().getBucket();

            case MINIO -> properties.getMinio().getBucket();
        };
    }
}
