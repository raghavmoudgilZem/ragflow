package com.ragflow.file.config;

import com.ragflow.file.storage.StorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@RequiredArgsConstructor
public class AwsConfig {

    @Bean
    @ConditionalOnProperty(
            prefix = "storage",
            name = "type",
            havingValue = "S3")
    public S3Client s3Client(StorageProperties properties) {

        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(
                        properties.getS3().getAccessKey(),
                        properties.getS3().getSecretKey());

        return S3Client.builder()
                .region(Region.of(properties.getS3().getRegion()))
                .credentialsProvider(
                        StaticCredentialsProvider.create(credentials))
                .build();
    }
}
