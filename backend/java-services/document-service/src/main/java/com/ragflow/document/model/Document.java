package com.ragflow.document.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "document", indexes = {
        @Index(name = "idx_doc_kb_id", columnList = "kb_id"),
        @Index(name = "idx_doc_parser_id", columnList = "parser_id"),
        @Index(name = "idx_doc_pipeline_id", columnList = "pipeline_id"),
        @Index(name = "idx_doc_status", columnList = "status")
})
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, updatable = false, nullable = false)
    private String id;

    @Column(columnDefinition = "TEXT")
    private String thumbnail;

    @Column(name = "kb_id", length = 36, nullable = false)
    private String kbId;

    @Column(name = "parser_id", length = 36, nullable = false)
    private String parserId;

    @Column(name = "pipeline_id", length = 36)
    private String pipelineId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parser_config", columnDefinition = "json")
    private Map<String, Object> parserConfig = new HashMap<>();

    @Column(name = "source_type", length = 128)
    private String sourceType = "local";

    @Column(length = 32, nullable = false)
    private String type;

    @Column(name = "created_by", length = 36, nullable = false)
    private String createdBy;

    @Column(length = 255)
    private String name;

    @Column(length = 255)
    private String location;

    @Column(nullable = false)
    private Integer size = 0;

    @Column(name = "token_num")
    private Integer tokenNum = 0;

    @Column(name = "chunk_num")
    private Integer chunkNum = 0;

    @Column()
    private Float progress = 0.0f;

    @Column(name = "progress_msg", columnDefinition = "TEXT")
    private String progressMsg = "";

    @Column(name = "process_begin_at")
    private LocalDateTime processBeginAt;

    @Column(name = "process_duration")
    private Float processDuration = 0.0f;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta_fields", columnDefinition = "json")
    private Map<String, Object> metaFields = new HashMap<>();

    @Column(length = 32, nullable = false)
    private String suffix = "";

    @Column(length = 1)
    private int run = 0;

    @Column(length = 1)
    private int status = 1;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedTime;
}
