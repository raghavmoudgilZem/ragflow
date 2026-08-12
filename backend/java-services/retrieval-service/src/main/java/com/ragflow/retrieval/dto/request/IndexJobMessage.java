package com.ragflow.retrieval.dto.request;

import com.ragflow.retrieval.entity.IndexJob;
import lombok.Builder;

import java.util.Map;

/**
 * What the worker is handed for one index job. Everything the pipeline needs
 * travels on the message, so it never re-reads the job row for input — only for
 * the cancellation check and its own progress updates.
 *
 * <p>Producer and consumer meet only as JSON, so this is deserialized by the
 * broker's converter straight into the canonical constructor.
 *
 * @param priority the {@link com.ragflow.retrieval.enums.JobPriority} name; the
 *                 publisher maps it back to a numeric broker priority
 */
@Builder
public record IndexJobMessage(
        Long jobId,
        String kbId,
        String docId,
        String tenantId,
        String docName,
        String storageType,
        String bucket,
        String objectKey,
        String parserId,
        Map<String, Object> parserConfig,
        String embeddingModelId,
        String priority) {

    public static IndexJobMessage from(IndexJob job) {
        return IndexJobMessage.builder()
                .jobId(job.getJobId())
                .kbId(job.getKbId())
                .docId(job.getDocId())
                .tenantId(job.getTenantId())
                .docName(job.getDocName())
                .storageType(job.getStorageType())
                .bucket(job.getStorageBucket())
                .objectKey(job.getStorageObjectKey())
                .parserId(job.getParserId())
                .parserConfig(job.getParserConfig())
                .embeddingModelId(job.getEmbeddingModelId())
                .priority(job.getPriority().name())
                .build();
    }
}
