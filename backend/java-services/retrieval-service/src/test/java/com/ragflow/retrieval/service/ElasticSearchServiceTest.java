package com.ragflow.retrieval.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ragflow.retrieval.dto.response.elasticSearch.ChunkResponse;
import com.ragflow.retrieval.dto.request.ElasticSearchRequest;
import com.ragflow.retrieval.dto.response.elasticSearch.ElasticSearchResponse;
import com.ragflow.retrieval.exception.SearchExecutionException;
import com.ragflow.retrieval.exception.SearchTimeoutException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ElasticSearchServiceTest {

    private ElasticsearchClient elasticsearchClient;
    private GeminiEmbeddingService embeddingService;
    private ElasticSearchService elasticSearchService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        elasticsearchClient = mock(ElasticsearchClient.class);
        embeddingService = mock(GeminiEmbeddingService.class);
        elasticSearchService = new ElasticSearchService(elasticsearchClient, embeddingService);
    }

    private ObjectNode sourceWithDocId(String docId) {
        return objectMapper.createObjectNode().put("doc_id", docId);
    }

    private Hit<ObjectNode> hit(String id, double score, String docId) {
        return Hit.of(h -> h.index("ragflow_idx").id(id).score(score).source(sourceWithDocId(docId)));
    }

    /**
     * Stubs elasticsearchClient.search(...) to route to a keyword or vector response
     * based on whether the captured request contains a knn clause, mirroring how the
     * two distinct SearchRequest shapes built by HybridVectorQueryBuilder differ.
     */
    private void stubSearches(List<Hit<ObjectNode>> keywordHits, List<Hit<ObjectNode>> vectorHits) throws IOException {
        when(elasticsearchClient.search(any(SearchRequest.class), eq(ObjectNode.class)))
                .thenAnswer(invocation -> {
                    SearchRequest req = invocation.getArgument(0);
                    List<Hit<ObjectNode>> hits = (req.knn() != null && !req.knn().isEmpty()) ? vectorHits : keywordHits;

                    // Safely map to wildcard-typed hits or cast to satisfy the builder's generic constraints
                    List<Hit<ObjectNode>> castedHits = (List<Hit<ObjectNode>>) (List<?>) hits;

                    return co.elastic.clients.elasticsearch.core.SearchResponse.of(r -> r
                            .took(1)
                            .timedOut(false)
                            .shards(sh -> sh.total(1).successful(1).failed(0))
                            .hits(h -> h.hits((List) castedHits)));
                });
    }

    private ElasticSearchRequest minimalRequest(String question) {
        return ElasticSearchRequest.builder()
                .question(question)
                .build();
    }

    @Test
    void appliesNullSafeDefaultsWhenOptionalFieldsAreMissing() throws IOException {
        when(embeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1, 0.2, 0.3));
        stubSearches(List.of(), List.of());

        elasticSearchService.performRagFlowHybridSearch(minimalRequest("test question"));

        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(elasticsearchClient, times(2)).search(captor.capture(), eq(ObjectNode.class));

        SearchRequest keywordReq = captor.getAllValues().stream()
                .filter(r -> r.knn() == null || r.knn().isEmpty())
                .findFirst().orElseThrow();
        SearchRequest vectorReq = captor.getAllValues().stream()
                .filter(r -> r.knn() != null && !r.knn().isEmpty())
                .findFirst().orElseThrow();

        // page defaults to 1, size defaults to 10 -> from = 0
        assertEquals(0, keywordReq.from());
        assertEquals(10, keywordReq.size());

        // topK defaults to 1024, vectorWeight defaults to 0.3f
        assertEquals(1024L, vectorReq.knn().get(0).k());
        assertEquals(10000L, vectorReq.knn().get(0).numCandidates());
        assertEquals(0.3f, vectorReq.knn().get(0).boost(), 0.0001f);
    }

    @Test
    void executesKeywordAndVectorSearchesInParallel() throws IOException {
        when(embeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1));
        stubSearches(List.of(), List.of());

        elasticSearchService.performRagFlowHybridSearch(minimalRequest("q"));

        // RR-204 (keyword) and RR-205 (vector) must both run.
        verify(elasticsearchClient, times(2)).search(any(SearchRequest.class), eq(ObjectNode.class));
    }

    @Test
    void mergesAndDeduplicatesHitsAcrossKeywordAndVectorResults() throws IOException {
        when(embeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1));

        List<Hit<ObjectNode>> keywordHits = List.of(
                hit("chunk-1", 2.0, "doc-a"),
                hit("chunk-2", 1.5, "doc-b")
        );
        List<Hit<ObjectNode>> vectorHits = List.of(
                hit("chunk-2", 0.91, "doc-b"),  // overlaps with keyword result
                hit("chunk-3", 0.85, "doc-c")
        );
        stubSearches(keywordHits, vectorHits);

        ElasticSearchResponse response = elasticSearchService.performRagFlowHybridSearch(minimalRequest("q"));

        assertEquals(3, response.total(), "4 hits with 1 overlapping id must merge to 3 unique chunks");

        List<String> ids = response.chunks().stream()
                .map(ChunkResponse::chunkId)
                .sorted()
                .toList();
        assertEquals(List.of("chunk-1", "chunk-2", "chunk-3"), ids);
    }

    @Test
    void keepsTheFirstOccurrenceWhenTheSameChunkIdAppearsInBothResultSets() throws IOException {
        when(embeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1));

        List<Hit<ObjectNode>> keywordHits = List.of(hit("chunk-1", 5.0, "doc-a"));
        List<Hit<ObjectNode>> vectorHits = List.of(hit("chunk-1", 0.99, "doc-a-vector-version"));
        stubSearches(keywordHits, vectorHits);

        ElasticSearchResponse response = elasticSearchService.performRagFlowHybridSearch(minimalRequest("q"));

        assertEquals(1, response.total());
        assertEquals("doc-a", response.chunks().get(0).docId(),
                "on collision the keyword-search hit (first in the stream) should be kept");
    }

    @Test
    void returnsWellFormedEmptyResponseWhenNoHitsFromEitherSearch() throws IOException {
        when(embeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1));
        stubSearches(List.of(), List.of());

        ElasticSearchResponse response = elasticSearchService.performRagFlowHybridSearch(minimalRequest("no matches"));

        assertEquals(0, response.total());
        assertTrue(response.chunks().isEmpty());
    }

    @Test
    void wrapsEmbeddingFailureInSearchExecutionException() {
        when(embeddingService.getEmbedding(anyString())).thenThrow(new RuntimeException("Gemini API down"));

        SearchExecutionException ex = assertThrows(SearchExecutionException.class,
                () -> elasticSearchService.performRagFlowHybridSearch(minimalRequest("q")));

        assertEquals("Failed to execute RagFlow Hybrid Search", ex.getMessage());
        assertNotNull(ex.getCause());
    }

    @Test
    void wrapsElasticsearchFailureInSearchExecutionException() throws IOException {
        when(embeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1));
        when(elasticsearchClient.search(any(SearchRequest.class), eq(ObjectNode.class)))
                .thenThrow(new IOException("ES cluster unreachable"));

        SearchExecutionException ex = assertThrows(SearchExecutionException.class,
                () -> elasticSearchService.performRagFlowHybridSearch(minimalRequest("q")));

        assertEquals("Failed to execute RagFlow Hybrid Search", ex.getMessage());
    }

    @Test
    void honorsExplicitlyProvidedPageSizeTopKAndWeight() throws IOException {
        when(embeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1));
        stubSearches(List.of(), List.of());

        ElasticSearchRequest request =
                ElasticSearchRequest.builder()
                        .question("q")
                        .page(2)
                        .size(5)
                        .topK(50)
                        .vectorSimilarityWeight(0.8f)
                        .build();

        elasticSearchService.performRagFlowHybridSearch(request);

        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(elasticsearchClient, times(2)).search(captor.capture(), eq(ObjectNode.class));

        SearchRequest keywordReq = captor.getAllValues().stream()
                .filter(r -> r.knn() == null || r.knn().isEmpty())
                .findFirst().orElseThrow();
        SearchRequest vectorReq = captor.getAllValues().stream()
                .filter(r -> r.knn() != null && !r.knn().isEmpty())
                .findFirst().orElseThrow();

        assertEquals(5, keywordReq.from()); // (page 2 - 1) * size 5
        assertEquals(5, keywordReq.size());
        assertEquals(50L, vectorReq.knn().get(0).k());
        assertEquals(0.8f, vectorReq.knn().get(0).boost(), 0.0001f);
    }

    @Test
    void throwsSearchTimeoutExceptionWhenCombinedExecutionExceedsThreshold() throws IOException {
        when(embeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1));

        when(elasticsearchClient.search(any(SearchRequest.class), eq(ObjectNode.class)))
                .thenAnswer(invocation -> {
                    Thread.sleep(3000); // exceeds SearchConstants.COMBINED_SEARCH_TIMEOUT_SECONDS (2s)
                    return SearchResponse.of(r -> r
                            .took(1).timedOut(false)
                            .shards(sh -> sh.total(1).successful(1).failed(0))
                            .hits(h -> h.hits(List.of())));
                });

        SearchTimeoutException ex = assertThrows(SearchTimeoutException.class,
                () -> elasticSearchService.performRagFlowHybridSearch(minimalRequest("q")));

        assertTrue(ex.getMessage().contains("timed out"));
    }
}
