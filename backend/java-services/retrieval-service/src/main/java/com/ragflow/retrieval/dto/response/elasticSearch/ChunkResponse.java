package com.ragflow.retrieval.dto.response.elasticSearch;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

/**
 * A single retrieved chunk, mapped from an Elasticsearch hit into RagFlow's
 * snake_case wire contract.
 */
@Builder
public record ChunkResponse(
        @JsonProperty("chunk_id")
        String chunkId,
        @JsonProperty("content_ltks")
        String contentLtks,
        @JsonProperty("content_with_weight")
        String contentWithWeight,
        @JsonProperty("doc_id")
        String docId,
        @JsonProperty("doc_name")
        String documentName,
        @JsonProperty("kb_id")
        String kbId,
        Double similarity,
        @JsonProperty("image_id")
        String imageId
) {}
