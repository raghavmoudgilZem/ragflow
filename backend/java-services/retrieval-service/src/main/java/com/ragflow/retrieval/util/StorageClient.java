package com.ragflow.retrieval.util;

import com.ragflow.retrieval.dto.request.ParsedContentRef;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class StorageClient {

    private final MinioClient minioClient;

    public StorageClient(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    public boolean canRead(ParsedContentRef ref) {
        if (!"MINIO".equalsIgnoreCase(ref.storageType())) {
            // S3 / GCS clients would branch here; MINIO is the only backend
            // wired up in this design doc.
            return false;
        }

        try {
            minioClient.statObject(StatObjectArgs.builder()
                    .bucket(ref.bucket())
                    .object(ref.objectKey())
                    .build());
            return true;
        } catch (Exception e) {
            log.warn("parsedContentRef unreadable: {}/{} ({})",
                    ref.bucket(), ref.objectKey(), e.getMessage());
            return false;
        }
    }


    /**
     * Fetches the parsed document content as text. The parsed object is
     * assumed to be UTF-8 text (e.g. a plain-text or JSON extraction of the
     * original document, produced upstream by document-service).
     */
    public String fetchText(String storageType, String bucket, String objectKey) throws IOException {
        if (!"MINIO".equalsIgnoreCase(storageType)) {
            throw new UnsupportedOperationException("Unsupported storageType: " + storageType);
        }

        try (InputStream is = minioClient.getObject(GetObjectArgs.builder()
                .bucket(bucket)
                .object(objectKey)
                .build())) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new IOException("Failed to read " + bucket + "/" + objectKey, e);
        }
    }
}
