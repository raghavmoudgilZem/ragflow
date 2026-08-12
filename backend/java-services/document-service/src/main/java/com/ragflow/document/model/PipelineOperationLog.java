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
@Table(name = "pipeline_operation_log", indexes = {
        @Index(name = "idx_pipeline_op_document_id", columnList = "document_id"),
        @Index(name = "idx_pipeline_op_tenant_id", columnList = "tenant_id"),
        @Index(name = "idx_pipeline_op_kb_id", columnList = "kb_id"),
        @Index(name = "idx_pipeline_op_pipeline_id", columnList = "pipeline_id"),
        @Index(name = "idx_pipeline_op_status", columnList = "status")
})
public class PipelineOperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    @Column(name = "document_id", length = 36)
    private String documentId;

    @Column(name = "tenant_id", length = 36, nullable = false)
    private String tenantId;

    @Column(name = "kb_id", length = 36, nullable = false)
    private String kbId;

    @Column(name = "pipeline_id", length = 36)
    private String pipelineId;

    @Column(name = "pipeline_title", length = 32)
    private String pipelineTitle;

    @Column(name = "parser_id", length = 36, nullable = false)
    private String parserId;

    @Column(name = "document_name", length = 255, nullable = false)
    private String documentName;

    @Column(name = "document_suffix", length = 255, nullable = false)
    private String documentSuffix;

    @Column(name = "document_type", length = 255, nullable = false)
    private String documentType;

    @Column(name = "source_from", length = 255, nullable = false)
    private String sourceFrom;

    @Column(nullable = false)
    private Float progress = 0.0f;

    @Column(name = "progress_msg", columnDefinition = "TEXT")
    private String progressMsg = "";

    @Column(name = "process_begin_at")
    private LocalDateTime processBeginAt;

    @Column(name = "process_duration", nullable = false)
    private Float processDuration = 0.0f;

    @Column(columnDefinition = "json")
    private String dsl = "{}";

    @Column(name = "task_type", length = 32, nullable = false)
    private String taskType = "";

    @Column(name = "operation_status", length = 32, nullable = false)
    private String operationStatus;

    @Column(columnDefinition = "TEXT")
    private String avatar;

    @Column(length = 1)
    private int status = 1;
}