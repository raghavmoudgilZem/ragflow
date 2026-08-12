package com.ragflow.document.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "task", indexes = {
        @Index(name = "idx_task_doc_id", columnList = "doc_id"),
        @Index(name = "idx_task_begin_at", columnList = "begin_at"),
        @Index(name = "idx_task_progress", columnList = "progress")
})
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 32, updatable = false, nullable = false)
    private String id;

    @Column(name = "doc_id", length = 32, nullable = false)
    private String docId;

    @Column(name = "from_page", nullable = false)
    private Integer fromPage = 0;

    @Column(name = "to_page", nullable = false)
    private Integer toPage = 100000000;

    @Column(name = "task_type", length = 32, nullable = false)
    private String taskType = "";

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(name = "begin_at")
    private LocalDateTime beginAt;

    @Column(name = "process_duration", nullable = false)
    private Float processDuration = 0.0f;

    @Column(nullable = false)
    private Float progress = 0.0f;

    @Column(name = "progress_msg", columnDefinition = "TEXT")
    private String progressMsg = "";

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(columnDefinition = "TEXT")
    private String digest = "";

    @Column(name = "chunk_ids", columnDefinition = "TEXT")
    private String chunkIds = "";
}