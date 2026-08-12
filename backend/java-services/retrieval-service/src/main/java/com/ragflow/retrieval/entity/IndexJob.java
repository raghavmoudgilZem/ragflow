package com.ragflow.retrieval.entity;


import com.ragflow.retrieval.enums.JobStatus;
import com.ragflow.retrieval.enums.JobPriority;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "index_jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndexJob {

    @Id
    @Column(name = "job_id", length = 64, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    @Column(name = "kb_id", length = 64, nullable = false)
    private String kbId;

    @Column(name = "doc_id", length = 64, nullable = false)
    private String docId;

    @Column(name = "tenant_id", length = 64, nullable = false)
    private String tenantId;

    @Column(name = "doc_name", length = 512, nullable = false)
    private String docName;

    @Column(name = "storage_type", length = 16, nullable = false)
    private String storageType;

    @Column(name = "storage_bucket", length = 256, nullable = false)
    private String storageBucket;

    @Column(name = "storage_object_key", length = 1024, nullable = false)
    private String storageObjectKey;

    @Column(name = "parser_id", length = 64, nullable = false)
    private String parserId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parser_config", nullable = false)
    private Map<String, Object> parserConfig;

    @Column(name = "embedding_model_id", length = 128, nullable = false)
    private String embeddingModelId;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 16, nullable = false)
    private JobPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16, nullable = false)
    private JobStatus status;

    @Column(name = "progress", nullable = false)
    private float progress;

    @Column(name = "chunk_count", nullable = false)
    private int chunkCount;

    @Column(name = "token_count", nullable = false)
    private int tokenCount;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;
}
