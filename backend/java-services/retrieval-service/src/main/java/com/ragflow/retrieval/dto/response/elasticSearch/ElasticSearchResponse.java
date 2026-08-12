package com.ragflow.retrieval.dto.response.elasticSearch;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.util.List;

@Builder
public record ElasticSearchResponse(List<ChunkResponse> chunks,
                                     @JsonProperty("doc_aggs")
                                    List<DocAggregationResponse> docAggs,
                                    List<String> labels,
                                    Integer total
) {
}