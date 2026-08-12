package com.ragflow.retrieval.dto.response.elasticSearch;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

/**
 * Per-document aggregation of chunk counts, returned alongside search results.
 */
@Builder
public record DocAggregationResponse(
        Integer count,
        @JsonProperty("doc_id")
        String docId,
        @JsonProperty("doc_name")
        String docName
) {
}
