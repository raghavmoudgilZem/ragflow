package com.ragflow.retrieval.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ragflow.retrieval.builder.ElasticSearchQueryBuilder;
import com.ragflow.retrieval.constants.SearchConstants;
import com.ragflow.retrieval.dto.request.ElasticSearchRequest;
import com.ragflow.retrieval.dto.response.elasticSearch.ElasticSearchResponse;
import com.ragflow.retrieval.exception.BusinessException;
import com.ragflow.retrieval.exception.ErrorCode;
import com.ragflow.retrieval.exception.SearchExecutionException;
import com.ragflow.retrieval.exception.SearchTimeoutException;
import com.ragflow.retrieval.mapper.ElasticSearchResponseMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Service responsible for executing hybrid vector and keyword searches against
 * Elasticsearch for RagFlow, merging results asynchronously using Java concurrency.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ElasticSearchService {

    private final ElasticsearchClient elasticsearchClient;
    private final GeminiEmbeddingService embeddingService;

    /**
     * Performs a hybrid search combining BM25 keyword matching and dense vector similarity search
     * in parallel, merging and deduplicating the resulting hits.
     */
    public ElasticSearchResponse performRagFlowHybridSearch(ElasticSearchRequest request) {
        String question = Optional.ofNullable(request)
                .map(ElasticSearchRequest::question)
                .orElse(null);
        log.info("START: performRagFlowHybridSearch for question: '{}'", question);

        try {
            if (StringUtils.isBlank(question)) {
                throw new IllegalArgumentException("Search request or question cannot be null/blank");
            }

            // 1. Generate high-dimensional vector embeddings from Gemini model
            // Connect to LLM Service inorder to get Embedding Vector in the future
            List<Double> queryVector = embeddingService.getEmbedding(question);

            log.info("Successfully generated query vector with dimensions: {}", queryVector != null ? queryVector.size() : 0);

            // 2. Resolve request parameters with null-safe fallback values
            int topK = Optional.ofNullable(request.topK()).orElse(SearchConstants.DEFAULT_TOP_K);
            int page = Optional.ofNullable(request.page()).orElse(SearchConstants.DEFAULT_PAGE);
            int size = Optional.ofNullable(request.size()).orElse(SearchConstants.DEFAULT_SIZE);
            float vectorWeight = Optional.ofNullable(request.vectorSimilarityWeight()).orElse(SearchConstants.DEFAULT_VECTOR_WEIGHT);
            log.debug("Resolved search parameters -> topK: {}, page: {}, size: {}, vectorWeight: {}", topK, page, size, vectorWeight);

            // 3. Construct Elasticsearch search requests for Keyword (RR-204) and Vector (RR-205)
            // SearchConstants.RAGFLOW_INDEX Should Convert into String Index="ragFlow_" + "tenant_id"
            SearchRequest keywordRequest = ElasticSearchQueryBuilder.buildKeywordSearchRequest(
                    SearchConstants.RAGFLOW_INDEX, question, request.datasetIds(), page, size);

            SearchRequest vectorRequest = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    SearchConstants.RAGFLOW_INDEX, queryVector, request.datasetIds(), topK, vectorWeight, page, size);

            log.info("Generated ES Search Requests for Keyword and Vector");

            // 4. Parallel Execution using CompletableFuture (RR-204 Keyword + RR-205 Vector)
            CompletableFuture<SearchResponse<ObjectNode>> keywordFuture =
                    CompletableFuture.supplyAsync(() -> executeSearch(keywordRequest, "keyword"));

            CompletableFuture<SearchResponse<ObjectNode>> vectorFuture =
                    CompletableFuture.supplyAsync(() -> executeSearch(vectorRequest, "vector"));

            // 5. Await both branches, bounded by the combined-execution timeout threshold
            List<Hit<ObjectNode>> keywordHits = List.of();
            List<Hit<ObjectNode>> vectorHits = List.of();
            try {
                CompletableFuture.allOf(keywordFuture, vectorFuture)
                        .get(SearchConstants.COMBINED_SEARCH_TIMEOUT_SECONDS, TimeUnit.SECONDS);
                keywordHits = keywordFuture.join().hits().hits();
                vectorHits = vectorFuture.join().hits().hits();
            }  catch (TimeoutException e) {
                log.error("Combined hybrid search execution exceeded {}s timeout for question '{}'",
                        SearchConstants.COMBINED_SEARCH_TIMEOUT_SECONDS, question, e);
                throw new SearchTimeoutException(   // <-- unchecked, not java.util.concurrent.TimeoutException
                        "Hybrid search timed out after " + SearchConstants.COMBINED_SEARCH_TIMEOUT_SECONDS + "s");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new BusinessException(ErrorCode.INTERNAL_THREAD_INTERRUPTION);
            }

            // 5. Result Merging & Deduplication based on Elasticsearch Document ID / Chunk ID
            // Fuse RRF Logic Work here
            List<Hit<ObjectNode>> uniqueMergedHits = Stream.concat(keywordHits.stream(), vectorHits.stream())
                    .filter(hit -> hit.source() != null)
                    .collect(Collectors.collectingAndThen(
                            Collectors.toMap(
                                    Hit::id,                              // Key by ES Document / Chunk ID
                                    hit -> hit,                           // Value is the hit itself
                                    (existing, replacement) -> existing   // Keep the first entry on collision
                            ),
                            map -> new ArrayList<>(map.values())
                    ));

            log.info("Successfully merged {} keyword hits and {} vector hits down to {} unique chunks.",
                    keywordHits.size(), vectorHits.size(), uniqueMergedHits.size());

            // 6. Map results to RagFlow contract response format
            ElasticSearchResponse response = ElasticSearchResponseMapper.mapToRagFlowResponse(uniqueMergedHits);

            log.info("END: performRagFlowHybridSearch successfully completed.");
            return response;

        } catch (SearchTimeoutException | BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to execute RagFlow Hybrid Search for question '{}'", question, e);
            throw new SearchExecutionException("Failed to execute RagFlow Hybrid Search", e);
        }
    }

    /**
     * Executes a single Elasticsearch query, wrapping any checked/unchecked failure
     */
    private SearchResponse<ObjectNode> executeSearch(SearchRequest request, String label) {
        try {
            return elasticsearchClient.search(request, ObjectNode.class);
        } catch (Exception e) {
            log.error("Elasticsearch {} search execution failed", label, e);
            throw new SearchExecutionException(label + " search execution failed", e);
        }
    }
}
