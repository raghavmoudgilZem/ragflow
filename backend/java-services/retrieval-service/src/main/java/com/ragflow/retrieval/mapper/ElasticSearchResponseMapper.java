package com.ragflow.retrieval.mapper;

import co.elastic.clients.elasticsearch.core.search.Hit;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ragflow.retrieval.constants.SearchConstants;
import com.ragflow.retrieval.dto.response.elasticSearch.ChunkResponse;
import com.ragflow.retrieval.dto.response.elasticSearch.ElasticSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Maps merged/deduplicated Elasticsearch hits into RagFlow's expected response contract.
 */
@Slf4j
public final class ElasticSearchResponseMapper {

    private ElasticSearchResponseMapper() {
        // Prevent instantiation of utility class
    }

    /**
     * Converts a list of merged Elasticsearch hits into a RagFlow-compatible
     */
    public static ElasticSearchResponse mapToRagFlowResponse(List<Hit<ObjectNode>> mergedHits) {
        log.info("START: mapToRagFlowResponse for {} merged hits", mergedHits != null ? mergedHits.size() : 0);

        List<ChunkResponse> chunks = Optional.ofNullable(mergedHits)
                .orElseGet(List::of)
                .stream()
                .filter(hit -> hit.source() != null)
                .map(ElasticSearchResponseMapper::toChunkResponse)
                .collect(Collectors.toCollection(ArrayList::new));

        ElasticSearchResponse response = ElasticSearchResponse.builder()
                .total(chunks.size())
                .chunks(chunks)
                .docAggs(new ArrayList<>())
                .labels(List.of())
                .build();


        log.info("END: mapToRagFlowResponse mapped {} chunks", chunks.size());
        return response;
    }

    /**
     * Maps a single Elasticsearch hit into a {@link ChunkResponse}.
     */
    private static ChunkResponse toChunkResponse(Hit<ObjectNode> hit) {
        ObjectNode source = hit.source();

        ChunkResponse.ChunkResponseBuilder builder = ChunkResponse.builder()
                .chunkId(hit.id())
                .similarity(Optional.ofNullable(hit.score()).orElse(0.0))
                .docId(fieldValue(source, SearchConstants.FIELD_DOC_ID))
                .documentName(fieldValue(source, SearchConstants.FIELD_DOC_NAME))
                .kbId(fieldValue(source, SearchConstants.FIELD_DATASET_ID))
                .contentWithWeight(fieldValue(source, SearchConstants.FIELD_CONTENT_WITH_WEIGHT))
                .contentLtks(fieldValue(source, SearchConstants.FIELD_CONTENT_LTKS))
                .imageId(fieldValue(source, SearchConstants.FIELD_IMAGE_ID));

        log.debug("Mapped chunk '{}' from source document", hit.id());
        return builder.build();
    }

    /**
     * Safely extracts a text field from the ES source document, returning {@code null}
     * (instead of throwing) when the field is absent.
     */
    private static String fieldValue(ObjectNode source, String fieldName) {
        return Optional.ofNullable(source.get(fieldName))
                .map(JsonNode::asText)
                .orElse(null);
    }
}
