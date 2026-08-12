package com.ragflow.retrieval.constants;

import lombok.experimental.UtilityClass;

/**
 * Centralized constants for the RagFlow hybrid search feature (elasticSearch).
 * <p>
 * Keeping these values in one place avoids "magic strings/numbers" scattered across the
 * builder, mapper and service classes, and makes the Elasticsearch index mapping,
 * default request values and response formatting rules easy to audit in one glance.
 */
@UtilityClass
public final class SearchConstants {

    // Elasticsearch index
    /** Target RagFlow Elasticsearch index (per knowledge-base tenant mapping). */
    public static final String RAGFLOW_INDEX = "ragflow_d53c61e280d611f18809b57bee4ba4c8";

    // Elasticsearch document field names (RagFlow index mapping)
    public static final String FIELD_CONTENT_LTKS = "content_ltks";
    public static final String FIELD_CONTENT_SM_LTKS = "content_sm_ltks";
    public static final String FIELD_TITLE_TKS = "title_tks";
    public static final String FIELD_TITLE_SM_TKS = "title_sm_tks";

    /** Dataset / Knowledge-base scoping field, used for multi-tenant filtering. */
    public static final String FIELD_DATASET_ID = "kb_id";

    /** Dense vector field holding the 3072-dimensional Gemini embedding. */
    public static final String FIELD_VECTOR = "q_3072_vec";

    public static final String FIELD_DOC_ID = "doc_id";
    public static final String FIELD_DOC_NAME = "docnm_kwd";
    public static final String FIELD_CONTENT_WITH_WEIGHT = "content_with_weight";
    public static final String FIELD_IMAGE_ID = "img_id";

    // k-NN vector search tuning
    /** Elasticsearch's hard ceiling for numCandidates on a k-NN query. */
    public static final int ES_MAX_NUM_CANDIDATES = 10_000;

    /** How many candidates to consider per requested neighbour (before capping). */
    public static final int CANDIDATE_MULTIPLIER = 10;

    // Default request fallbacks (used when the caller omits a field)
    public static final int DEFAULT_TOP_K = 1024;
    public static final int DEFAULT_PAGE = 1;
    public static final int DEFAULT_SIZE = 10;
    public static final float DEFAULT_VECTOR_WEIGHT = 0.3f;

    public static final int MAX_QUESTION_LENGTH = 1000;
    /** Delimiter used to join highlight fragments coming from different fields. */
    public static final String HIGHLIGHT_DELIMITER = "... ";

    /** Max wall-clock time allowed for the combined keyword + vector search execution. */
    public static final long COMBINED_SEARCH_TIMEOUT_SECONDS = 1;
}
