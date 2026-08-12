package com.ragflow.retrieval.entity;

import com.ragflow.retrieval.enums.IndexRegistryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "index_registry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndexRegistry {

    @Id
    @Column(name = "kb_id", length = 64, nullable = false, updatable = false)
    private String kbId;

    @Column(name = "tenant_id", length = 64, nullable = false)
    private String tenantId;

    @Column(name = "es_index_name", length = 128, nullable = false)
    private String esIndexName;

    @Column(name = "vector_dim", nullable = false)
    private int vectorDim;

    @Column(name = "embedding_model_id", length = 64, nullable = false)
    private String embeddingModelId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16, nullable = false)
    private IndexRegistryStatus status;

    @Column(name = "doc_count", nullable = false)
    private int docCount;

    @Column(name = "chunk_count", nullable = false)
    private int chunkCount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}