package com.ragflow.retrieval.builder;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MultiMatchQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TermsQuery;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch._types.KnnSearch;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Covers the bug fix in HybridVectorQueryBuilder: queries must target fields that
 * actually exist in the RagFlow ES mapping (content_ltks/content_sm_ltks/title_tks/
 * title_sm_tks and kb_id), not the non-existent "content"/"title"/"dataset_id" fields
 * that previously caused every search to silently return zero hits.
 */
class ElasticSearchQueryBuilderTest {

    private static final String INDEX = "ragflow_d53c61e280d611f18809b57bee4ba4c8";

    @Nested
    @DisplayName("RR-204: Keyword (BM25) search request")
    class KeywordElasticSearchRequestTests {

        @Test
        @DisplayName("targets the real mapped text fields, not 'content'/'title'")
        void usesCorrectTextFields() {
            SearchRequest request = ElasticSearchQueryBuilder.buildKeywordSearchRequest(
                    INDEX, "what is retrieval augmented generation", null, 1, 10);

            MultiMatchQuery multiMatch = extractMultiMatch(request);

            List<String> fields = multiMatch.fields();
            assertTrue(fields.contains("content_ltks"), "must query content_ltks");
            assertTrue(fields.contains("content_sm_ltks"), "must query content_sm_ltks");
            assertTrue(fields.contains("title_tks"), "must query title_tks");
            assertTrue(fields.contains("title_sm_tks"), "must query title_sm_tks");
            assertFalse(fields.contains("content"), "'content' does not exist in the ES mapping");
            assertFalse(fields.contains("title"), "'title' does not exist in the ES mapping");
        }

        @Test
        @DisplayName("carries the raw question text into the multi-match query")
        void carriesQueryText() {
            SearchRequest request = ElasticSearchQueryBuilder.buildKeywordSearchRequest(
                    INDEX, "hybrid search", null, 1, 10);

            MultiMatchQuery multiMatch = extractMultiMatch(request);
            assertEquals("hybrid search", multiMatch.query());
        }

        @Test
        @DisplayName("computes from/size pagination correctly")
        void computesPagination() {
            SearchRequest page1 = ElasticSearchQueryBuilder.buildKeywordSearchRequest(
                    INDEX, "q", null, 1, 10);
            assertEquals(0, page1.from());
            assertEquals(10, page1.size());

            SearchRequest page3 = ElasticSearchQueryBuilder.buildKeywordSearchRequest(
                    INDEX, "q", null, 3, 10);
            assertEquals(20, page3.from());
            assertEquals(10, page3.size());
        }

        @Test
        @DisplayName("applies kb_id terms filter when dataset IDs are provided")
        void appliesDatasetFilterWhenPresent() {
            SearchRequest request = ElasticSearchQueryBuilder.buildKeywordSearchRequest(
                    INDEX, "q", Arrays.asList("kb-1", "kb-2"), 1, 10);

            BoolQuery bool = request.query().bool();
            assertFalse(bool.filter().isEmpty(), "expected a filter clause for dataset scoping");

            TermsQuery terms = bool.filter().get(0).terms();
            assertEquals("kb_id", terms.field(), "dataset scoping must use kb_id, not dataset_id");
        }

        @Test
        @DisplayName("omits the dataset filter when no dataset IDs are provided")
        void omitsDatasetFilterWhenAbsent() {
            SearchRequest requestNull = ElasticSearchQueryBuilder.buildKeywordSearchRequest(
                    INDEX, "q", null, 1, 10);
            assertTrue(requestNull.query().bool().filter().isEmpty());

            SearchRequest requestEmpty = ElasticSearchQueryBuilder.buildKeywordSearchRequest(
                    INDEX, "q", Collections.emptyList(), 1, 10);
            assertTrue(requestEmpty.query().bool().filter().isEmpty());
        }

        @Test
        @DisplayName("targets the correct index")
        void targetsCorrectIndex() {
            SearchRequest request = ElasticSearchQueryBuilder.buildKeywordSearchRequest(
                    INDEX, "q", null, 1, 10);
            assertEquals(List.of(INDEX), request.index());
        }

        private MultiMatchQuery extractMultiMatch(SearchRequest request) {
            Query must = request.query().bool().must().get(0);
            return must.multiMatch();
        }
    }

    @Nested
    @DisplayName("RR-205: Vector (KNN) search request")
    class VectorElasticSearchRequestTests {

        @Test
        @DisplayName("targets the correct dense_vector field")
        void usesCorrectVectorField() {
            SearchRequest request = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    INDEX, List.of(0.1, 0.2, 0.3), null, 100, 0.5f, 1, 10);

            KnnSearch knn = request.knn().get(0);
            assertEquals("q_3072_vec", knn.field());
        }

        @Test
        @DisplayName("converts the Double query vector to Float without precision loss")
        void convertsVectorValues() {
            SearchRequest request = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    INDEX, List.of(0.25, -0.5, 1.0), null, 100, 0.5f, 1, 10);

            KnnSearch knn = request.knn().get(0);
            assertEquals(List.of(0.25f, -0.5f, 1.0f), knn.queryVector());
        }

        @Test
        @DisplayName("sets k to topK")
        void setsK() {
            SearchRequest request = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    INDEX, List.of(0.1), null, 256, 0.5f, 1, 10);

            KnnSearch knn = request.knn().get(0);
            assertEquals(256L, knn.k());
        }

        @Test
        @DisplayName("numCandidates scales with topK but is capped at the ES limit of 10,000")
        void capsNumCandidates() {
            SearchRequest smallTopK = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    INDEX, List.of(0.1), null, 100, 0.5f, 1, 10);
            assertEquals(1000L, smallTopK.knn().get(0).numCandidates());

            SearchRequest largeTopK = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    INDEX, List.of(0.1), null, 5000, 0.5f, 1, 10);
            assertEquals(10000L, largeTopK.knn().get(0).numCandidates(),
                    "numCandidates must never exceed the Elasticsearch hard limit of 10,000");
        }

        @Test
        @DisplayName("applies vector_similarity_weight as a boost on the KNN clause itself")
        void appliesVectorSimilarityWeightAsBoost() {
            SearchRequest request = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    INDEX, List.of(0.1), null, 100, 0.73f, 1, 10);

            KnnSearch knn = request.knn().get(0);
            assertNotNull(knn.boost(), "vector_similarity_weight must flow into the KNN query, not just client-side blending");
            assertEquals(0.73f, knn.boost(), 0.0001f);
        }

        @Test
        @DisplayName("applies kb_id terms filter when dataset IDs are provided")
        void appliesDatasetFilterWhenPresent() {
            SearchRequest request = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    INDEX, List.of(0.1), Arrays.asList("kb-1"), 100, 0.5f, 1, 10);

            KnnSearch knn = request.knn().get(0);
            assertFalse(knn.filter().isEmpty());
            assertEquals("kb_id", knn.filter().get(0).terms().field());
        }

        @Test
        @DisplayName("omits the dataset filter when no dataset IDs are provided")
        void omitsDatasetFilterWhenAbsent() {
            SearchRequest request = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    INDEX, List.of(0.1), null, 100, 0.5f, 1, 10);

            KnnSearch knn = request.knn().get(0);
            assertTrue(knn.filter().isEmpty());
        }

        @Test
        @DisplayName("computes from/size pagination correctly")
        void computesPagination() {
            SearchRequest request = ElasticSearchQueryBuilder.buildVectorSearchRequest(
                    INDEX, List.of(0.1), null, 100, 0.5f, 2, 20);
            assertEquals(20, request.from());
            assertEquals(20, request.size());
        }
    }
}
