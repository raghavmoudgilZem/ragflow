package com.ragflow.retrieval.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SearchDetailResponse {

    private String id;
    private String name;
    private String description;
    private String avatar;
    private String status;

    @JsonProperty("tenant_id")
    private String tenantId;

    @JsonProperty("created_by")
    private String createdBy;

    @JsonProperty("create_time")
    private Long createTime;

    @JsonProperty("update_time")
    private Long updateTime;

    @JsonProperty("create_date")
    private String createDate;

    @JsonProperty("update_date")
    private String updateDate;

    @JsonProperty("search_config")
    private SearchConfigResponse searchConfig;
}
