package com.ragflow.retrieval.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetResponse {
    private String id;
    private String name;
    private Integer docNum;
    private Integer chunkNum;
    private Integer tokenNum;
    private Long createTime;
    private Long updateTime;
    private String tenantId;
}
