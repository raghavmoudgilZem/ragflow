package com.ragflow.dataset.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ragflow.dataset.enums.ChunkMethod;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "knowledgebase")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Knowledgebase {

    @Id
    @Column(name = "id")
    @UuidGenerator
    private UUID id;

    @Lob
    @Column(name = "avatar")
    private String avatar;

    @Column(name = "tenant_id", length = 32, nullable = false)
    private String tenantId;

    @Column(name = "name", length = 128, nullable = false)
    private String name;

    @Column(name = "language", length = 32)
    @Builder.Default
    private String language = "English";

    @Lob
    @Column(name = "description")
    private String description;

   // @Column(name = "embd_id", length = 128, nullable = false)
    private String embdId;

    @Column(name = "tenant_embd_id")
    private Integer tenantEmbdId;

    //@Column(name = "permission", length = 16, nullable = false)
    @Builder.Default
    private String permission = "me";

    //@Column(name = "created_by", length = 32, nullable = false)
    private String createdBy;

    @Column(name = "doc_num")
    @Builder.Default
    private Integer docNum = 0;

    @Column(name = "token_num")
    @Builder.Default
    private Integer tokenNum = 0;

    @Column(name = "chunk_num")
    @Builder.Default
    private Integer chunkNum = 0;

    @Column(name = "similarity_threshold")
    @Builder.Default
    private Float similarityThreshold = 0.2f;

    @Column(name = "vector_similarity_weight")
    @Builder.Default
    private Float vectorSimilarityWeight = 0.3f;

   // @Column(name = "parser_id", length = 32, nullable = false)
    @Builder.Default
    private String parserId = ChunkMethod.GENERAL.getCode();

    @Column(name = "pipeline_id", length = 32)
    private String pipelineId;

    @Column(name = "parser_config", columnDefinition = "TEXT")
    private String parserConfig;

    @Column(name = "pagerank")
    @Builder.Default
    private Integer pagerank = 0;

    @Column(name = "graphrag_task_id", length = 32)
    private String graphragTaskId;

    @Column(name = "graphrag_task_finish_at")
    private LocalDateTime graphragTaskFinishAt;

    @Column(name = "raptor_task_id", length = 32)
    private String raptorTaskId;

    @Column(name = "raptor_task_finish_at")
    private LocalDateTime raptorTaskFinishAt;

    @Column(name = "mindmap_task_id", length = 32)
    private String mindmapTaskId;

    @Column(name = "mindmap_task_finish_at")
    private LocalDateTime mindmapTaskFinishAt;

    @Column(name = "status", length = 1)
    @Builder.Default
    private String status = "1";

    @JsonProperty("create_time")
    private LocalDateTime createTime;

    @JsonProperty("update_time")
    private LocalDateTime updateTime;



}
