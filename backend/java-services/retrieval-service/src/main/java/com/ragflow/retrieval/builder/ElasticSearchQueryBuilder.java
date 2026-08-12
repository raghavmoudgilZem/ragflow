package com.ragflow.retrieval.builder;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import com.ragflow.retrieval.constants.SearchConstants;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Utility builder class for constructing Elasticsearch search requests
 * compatible with RagFlow's hybrid retrieval architecture (BM25 keyword search + k-NN vector search).
 */
@Slf4j
public final class ElasticSearchQueryBuilder {

    private ElasticSearchQueryBuilder() {
        // Prevent instantiation of utility class
    }

    /**
     * RR-204: Builds a BM25 Keyword Search Request against text fields.
     *
     * @param index      The Elasticsearch index name
     * @param question   The search query text
     * @param datasetIds List of knowledge base IDs for data isolation (optional)
     * @param page       Current page number (1-indexed)
     * @param size       Number of results per page
     * @return Configured Elasticsearch {@link SearchRequest}
     */
    public static SearchRequest buildKeywordSearchRequest(
            String index,
            String question,
            List<String> datasetIds,
            int page,
            int size) {

        log.info("START: buildKeywordSearchRequest for index '{}', page {}, size {}", index, page, size);

        int paginationFrom = Math.max(0, (page - 1) * size);

        SearchRequest request = SearchRequest.of(s -> s
                .index(index)
                .from(paginationFrom)
                .size(size)
                .query(q -> q
                        .bool(b -> {
                            // 1. Multi-match BM25 query on tokenized text fields
                            b.must(m -> m
                                    .multiMatch(mm -> mm
                                            .query(question)
                                            .fields(
                                                    SearchConstants.FIELD_CONTENT_LTKS,
                                                    SearchConstants.FIELD_CONTENT_SM_LTKS,
                                                    SearchConstants.FIELD_TITLE_TKS,
                                                    SearchConstants.FIELD_TITLE_SM_TKS
                                            )
                                    )
                            );

                            // 2. Filter by Dataset IDs for multi-tenancy / isolation
                            if (isCollectionValid(datasetIds)) {
                                b.filter(buildDatasetFilter(datasetIds));
                            }

                            return b;
                        })
                )
        );

        log.info("END: buildKeywordSearchRequest completed for index '{}'", index);
        return request;
    }

    /**
     * RR-205: Builds a k-NN Vector Search Request for semantic retrieval.
     *
     * @param index        The Elasticsearch index name
     * @param queryVector  The generated high-dimensional query embedding (Double precision)
     * @param datasetIds   List of knowledge base IDs for data isolation (optional)
     * @param topK         The number of nearest neighbors to fetch
     * @param vectorWeight The relative boosting weight for vector similarity
     * @param page         Current page number (1-indexed)
     * @param size         Number of results per page
     * @return Configured Elasticsearch {@link SearchRequest}
     */
    public static SearchRequest buildVectorSearchRequest(
            String index,
            List<Double> queryVector,
            List<String> datasetIds,
            int topK,
            float vectorWeight,
            int page,
            int size) {

        log.info("START: buildVectorSearchRequest for index '{}', topK {}, vectorWeight {}", index, topK, vectorWeight);

        List<Float> floatVector = convertToFloatList(queryVector);
        log.debug("Converted query vector to Float format. Target dimension: {}", floatVector.size());

        int paginationFrom = Math.max(0, (page - 1) * size);
        long calculatedCandidates = Math.min((long) topK * SearchConstants.CANDIDATE_MULTIPLIER, SearchConstants.ES_MAX_NUM_CANDIDATES);

        SearchRequest request = SearchRequest.of(s -> s
                .index(index)
                .from(paginationFrom)
                .size(size)
                .knn(k -> {
                    // vectorWeight is applied as a boost directly on the KNN clause so that
                    // vector_similarity_weight actually influences the ES-side ranking,
                    // not just a client-side blend of scores.
                    k.field(SearchConstants.FIELD_VECTOR)
                            .queryVector(floatVector)
                            .k((long) topK)
                            .numCandidates(calculatedCandidates)
                            .boost(vectorWeight);

                    if (isCollectionValid(datasetIds)) {
                        k.filter(buildDatasetFilter(datasetIds));
                    }

                    return k;
                })
        );

        log.info("END: buildVectorSearchRequest completed for index '{}'", index);
        return request;
    }

    /**
     * Helper method to build an Elasticsearch terms filter for dataset isolation.
     */
    private static Query buildDatasetFilter(List<String> datasetIds) {
        List<FieldValue> fieldValues = datasetIds.stream()
                .map(FieldValue::of)
                .collect(Collectors.toList());

        return Query.of(q -> q
                .terms(t -> t
                        .field(SearchConstants.FIELD_DATASET_ID)
                        .terms(tv -> tv.value(fieldValues))
                )
        );
    }

    /**
     * Safely checks if a list is neither null nor empty.
     */
    private static boolean isCollectionValid(List<String> list) {
        return list != null && !list.isEmpty();
    }

    /**
     * Converts a list of Double precision embeddings into Float precision required by Elasticsearch API.
     */
    private static List<Float> convertToFloatList(List<Double> doubleList) {
        return Optional.ofNullable(doubleList)
                .map(list -> list.stream().map(Double::floatValue).collect(Collectors.toList()))
                .orElseGet(List::of);
    }
}
