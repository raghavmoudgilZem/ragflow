package com.ragflow.dataset.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Equivalent of `remap_dictionary_keys(k.to_dict())` -- internal column
 * names (embd_id, parser_id) are remapped to the API-facing names
 * (embedding_model, chunk_method) used in the request/response contract.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetResponseDto {

    private UUID id;
    private String name;
    private String avatar;
    private String description;

    @JsonProperty("embedding_model")
    private String embeddingModel;

    @JsonProperty("chunk_method")
    private String chunkMethod;

    @JsonProperty("pipeline_id")
    private String pipelineId;

    private String permission;

    @JsonProperty("parser_config")
    private String parserConfig;

    @JsonProperty("create_time")
    private LocalDateTime createTime;

    @JsonProperty("update_time")
    private LocalDateTime updateTime;

    @JsonProperty("doc_num")
    private Integer docNum;

    @JsonProperty("token_num")
    private Integer tokenNum;

    @JsonProperty("chunk_num")
    private Integer chunkNum;

    /** Total size (bytes) across all valid documents in the dataset. */
    @JsonProperty("total_size")
    private Long totalSize;

    @JsonProperty("similarity_threshold")
    private Double similarityThreshold;

    @JsonProperty("vector_similarity_weight")
    private Double vectorSimilarityWeight;

    private Integer pagerank;

    @JsonProperty("task_timestamps")
    private TaskTimestampsDto taskTimestamps;

    private String status;
    private String language;
    private String tenantId;



}
