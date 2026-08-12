package com.ragflow.retrieval.mapper;

import co.elastic.clients.elasticsearch.core.search.Hit;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ragflow.retrieval.dto.response.elasticSearch.ChunkResponse;
import com.ragflow.retrieval.dto.response.elasticSearch.ElasticSearchResponse;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ElasticSearchResponseMapperTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void mapsAllKnownFieldsFromSource() {
        ObjectNode source = objectMapper.createObjectNode();
        source.put("doc_id", "doc-123");
        source.put("docnm_kwd", "architecture.pdf");
        source.put("kb_id", "kb-456");
        source.put("content_with_weight", "The full chunk content.");
        source.put("content_ltks", "the full chunk content");
        source.put("image_id", "img-789");

        Hit<ObjectNode> hit = Hit.of(h -> h
                .index("ragflow_idx")
                .id("chunk-1")
                .score(1.85)
                .source(source));

        ElasticSearchResponse response = ElasticSearchResponseMapper.mapToRagFlowResponse(List.of(hit));

        assertEquals(1, response.total());
        assertEquals(1, response.chunks().size());

        ChunkResponse chunk = response.chunks().get(0);
        assertEquals("chunk-1", chunk.chunkId());
        assertEquals(1.85, chunk.similarity());
        assertEquals("doc-123", chunk.docId());
        assertEquals("architecture.pdf", chunk.documentName());
        assertEquals("kb-456", chunk.kbId());
        assertEquals("The full chunk content.", chunk.contentWithWeight());
        assertEquals("the full chunk content", chunk.contentLtks());
        // Note: mapper reads "image_id" but the ES mapping field is "img_id" -
        // this mismatch means imageId will not populate from real documents.
    }

    @Test
    void defaultsSimilarityToZeroWhenScoreMissing() {
        ObjectNode source = objectMapper.createObjectNode();
        source.put("doc_id", "doc-1");

        Hit<ObjectNode> hit = Hit.of(h -> h
                .index("ragflow_idx")
                .id("chunk-1")
                .source(source));

        ElasticSearchResponse response = ElasticSearchResponseMapper.mapToRagFlowResponse(List.of(hit));

        assertEquals(0.0, response.chunks().get(0).similarity());
    }

    @Test
    void skipsHitsWithNullSource() {
        Hit<ObjectNode> validHit = Hit.of(h -> h
                .index("ragflow_idx")
                .id("chunk-1")
                .source(objectMapper.createObjectNode().put("doc_id", "doc-1")));

        Hit<ObjectNode> nullSourceHit = Hit.of(h -> h
                .index("ragflow_idx")
                .id("chunk-2"));

        ElasticSearchResponse response = ElasticSearchResponseMapper.mapToRagFlowResponse(List.of(validHit, nullSourceHit));

        assertEquals(1, response.chunks().size());
        assertEquals("chunk-1", response.chunks().get(0).chunkId());
    }

    @Test
    void handlesEmptyListWithoutError() {
        ElasticSearchResponse response = ElasticSearchResponseMapper.mapToRagFlowResponse(new ArrayList<>());

        assertEquals(0, response.total());
        assertTrue(response.chunks().isEmpty());
        assertTrue(response.docAggs().isEmpty());
        assertTrue(response.labels().isEmpty());
    }

    @Test
    void handlesNullListWithoutError() {
        ElasticSearchResponse response = ElasticSearchResponseMapper.mapToRagFlowResponse(null);

        assertEquals(0, response.total());
        assertTrue(response.chunks().isEmpty());
    }

    @Test
    void onlyMapsFieldsPresentOnTheSource() {
        // A source containing only some of the known fields should not blow up,
        // and absent fields should simply stay null on the ChunkResponse.
        ObjectNode source = objectMapper.createObjectNode();
        source.put("content_ltks", "just content, no doc id or kb id");

        Hit<ObjectNode> hit = Hit.of(h -> h
                .index("ragflow_idx")
                .id("chunk-1")
                .source(source));

        ElasticSearchResponse response = ElasticSearchResponseMapper.mapToRagFlowResponse(List.of(hit));
        ChunkResponse chunk = response.chunks().get(0);

        assertEquals("just content, no doc id or kb id", chunk.contentLtks());
        assertNull(chunk.docId());
        assertNull(chunk.kbId());
        assertNull(chunk.documentName());
    }
}
