package com.ragflow.file.config;

import com.ragflow.file.storage.StorageProperties;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class MinIoConfig {

    private final StorageProperties properties;

    @Bean
    @ConditionalOnProperty(
            prefix = "storage",
            name = "type",
            havingValue = "MINIO")
    public MinioClient minioClient(StorageProperties properties) {

        return MinioClient.builder()
                .endpoint(properties.getMinio().getEndpoint())
                .credentials(
                        properties.getMinio().getAccessKey(),
                        properties.getMinio().getSecretKey())
                .build();
    }

}