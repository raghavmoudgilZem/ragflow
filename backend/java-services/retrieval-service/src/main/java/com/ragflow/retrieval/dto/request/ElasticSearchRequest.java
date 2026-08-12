package com.ragflow.retrieval.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ragflow.retrieval.constants.SearchConstants;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;
import java.util.Map;

/**
 * Incoming hybrid search request payload.
 * <p>
 * Field validation is declared here via bean-validation annotations (rather than
 * imperative null checks in the service layer) so that malformed requests are
 * rejected at the controller boundary with a clear {@code 400} response.
 * <p>
 * Wire format follows RagFlow's snake_case JSON contract via {@link JsonProperty}.
 *
 * @param question              free-text search query, required
 * @param datasetIds            knowledge-base IDs to scope the search to (optional)
 * @param similarityThreshold   minimum similarity score to keep a hit (optional)
 * @param vectorSimilarityWeight relative boost applied to the k-NN vector clause (0.0-1.0)
 * @param topK                  number of nearest neighbours to fetch for the vector search
 * @param useKg                 whether to leverage the knowledge graph (currently unused downstream)
 * @param metaDataFilter        arbitrary metadata filter clauses (optional)
 * @param page                  1-indexed page number
 * @param size                  page size
 * @param highlight             whether highlighted fragments should be returned
 */
@Builder
public record ElasticSearchRequest(

        @NotBlank(message = "question must not be blank")
        @Size(max = SearchConstants.MAX_QUESTION_LENGTH, message = "question exceeds maximum allowed length")
        String question,

        @JsonProperty("dataset_ids")
        List<String> datasetIds,

        @JsonProperty("similarity_threshold")
        @DecimalMin(value = "0.0", message = "similarity_threshold must be >= 0.0")
        @DecimalMax(value = "1.0", message = "similarity_threshold must be <= 1.0")
        Float similarityThreshold,

        @JsonProperty("vector_similarity_weight")
        @DecimalMin(value = "0.0", message = "vector_similarity_weight must be >= 0.0")
        @DecimalMax(value = "1.0", message = "vector_similarity_weight must be <= 1.0")
        Float vectorSimilarityWeight,

        @JsonProperty("top_k")
        @Positive(message = "top_k must be a positive number")
        Integer topK,

        @JsonProperty("use_kg")
        Boolean useKg,

        @JsonProperty("meta_data_filter")
        Map<String, Object> metaDataFilter,

        @Min(value = 1, message = "page must be >= 1")
        Integer page,

        @Min(value = 1, message = "size must be >= 1")
        Integer size,

        Boolean highlight
) {
}
