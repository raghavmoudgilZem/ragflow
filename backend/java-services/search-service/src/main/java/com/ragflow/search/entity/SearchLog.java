package com.ragflow.search.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

/**
 * New table — search execution telemetry.
 * Written asynchronously after each unified search call.
 */
@Entity
@Table(name = "search_log", indexes = {
        @Index(name = "idx_log_tenant_user", columnList = "tenant_id,user_id"),
        @Index(name = "idx_log_created_at",  columnList = "created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchLog {

    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", length = 36, nullable = false)
    private String tenantId;

    @Column(name = "user_id", length = 36, nullable = false)
    private String userId;

    @Column(name = "query", columnDefinition = "TEXT", nullable = false)
    private String query;

    /** all | dataset | chat */
    @Column(name = "search_type", length = 50)
    @Builder.Default
    private String searchType = "all";

    @Column(name = "result_count")
    @Builder.Default
    private Integer resultCount = 0;

    /** Execution time in milliseconds */
    @Column(name = "duration_ms")
    @Builder.Default
    private Integer durationMs = 0;

    @Column(name = "filters", columnDefinition = "JSON")
    private String filters;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}