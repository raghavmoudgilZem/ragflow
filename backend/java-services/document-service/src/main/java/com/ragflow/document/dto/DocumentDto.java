package com.ragflow.document.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record DocumentDto(

        Info info,

        @JsonProperty("chunk_num")
        Integer chunkNum,

        @JsonProperty("create_date")
        String createDate,

        @JsonProperty("create_time")
        Long createTime,

        String id,

        @JsonProperty("kb_id")
        String kbId,

        String location,

        String nickname,

        @JsonProperty("parser_id")
        String parserId,

        @JsonProperty("pipeline_id")
        String pipelineId,

        @JsonProperty("pipeline_name")
        String pipelineName,

        Float progress,

        Integer run,

        @JsonProperty("source_type")
        String sourceType,

        String suffix,

        String thumbnail,

        @JsonProperty("token_num")
        Integer tokenNum
) {

    public record Info(

            @JsonProperty("create_date")
            String createDate,

            @JsonProperty("create_time")
            Long createTime,

            String name,

            Long size,

            String type,

            @JsonProperty("update_date")
            String updateDate,

            @JsonProperty("update_time")
            Long updateTime
    ) {
    }
}