package com.ragflow.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

