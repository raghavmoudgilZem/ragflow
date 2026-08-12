package com.ragflow.document.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Map;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public record KnowledgebaseDto(
        String id,
        String avatar,
        String tenantId,
        String name,
        String language,
        String description,
        String embdId,
        String permission,
        String createdBy,

        Integer docNum,
        Integer tokenNum,
        Integer chunkNum,

        Float similarityThreshold,
        Float vectorSimilarityWeight,

        String parserId,
        String pipelineId,
        Map<String, Object> parserConfig,
        Integer pagerank,

        String graphragTaskId,
        LocalDateTime graphragTaskFinishAt,

        String raptorTaskId,
        LocalDateTime raptorTaskFinishAt,

        String mindmapTaskId,
        LocalDateTime mindmapTaskFinishAt,

        String status
) {}
