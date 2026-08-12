package com.ragflow.file.storage;

import com.ragflow.file.enums.StorageType;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    private StorageType type;

    private Local local = new Local();
    private S3 s3 = new S3();
    private Minio minio = new Minio();

    @Data
    public static class Local {
        private String path;
    }

    @Data
    public static class S3 {
        private String bucket;
        private String region;
        private String accessKey;
        private String secretKey;
    }

    @Data
    public static class Minio {
        private String endpoint;
        private String bucket;
        private String accessKey;
        private String secretKey;
    }
}
