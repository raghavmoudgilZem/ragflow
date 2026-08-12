package com.ragflow.search.constant;

/**
 * All constants in one place.
 */
public final class AppConstants {

    private AppConstants() {}

    // ── Date Time Types ──────────────────────────────────────────────────────────
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    // ── Gateway Headers ───────────────────────────────────────────────────────
    public static final String HEADER_TENANT_ID = "X-Tenant-Id";
    public static final String HEADER_USER_ID   = "X-User-Id";

    // ── Search Status ─────────────────────────────────────────────────────────
    public static final int STATUS_VALID   = 1;
    public static final int STATUS_INVALID = 0;

    // ── Search Types ──────────────────────────────────────────────────────────
    public static final String TYPE_ALL     = "all";
    public static final String TYPE_DATASET = "dataset";
    public static final String TYPE_CHAT    = "chat";

    // ── Search Modes ──────────────────────────────────────────────────────────
    public static final String MODE_HYBRID   = "hybrid";
    public static final String MODE_KEYWORD  = "keyword";
    public static final String MODE_SEMANTIC = "semantic";

    // ── Result Sources ────────────────────────────────────────────────────────
    public static final String SOURCE_DATASET = "dataset";
    public static final String SOURCE_CHAT    = "chat";

    // ── Result Types ──────────────────────────────────────────────────────────
    public static final String RESULT_TYPE_CHUNK    = "chunk";
    public static final String RESULT_TYPE_DOCUMENT = "document";
    public static final String RESULT_TYPE_MESSAGE  = "message";

    // ── Snippet Config ────────────────────────────────────────────────────────
    public static final int SNIPPET_MAX_LENGTH = 200;
    public static final int SNIPPET_CONTEXT_CHARS = 80;

    // ── Rate Limit Redis Key ──────────────────────────────────────────────────
    public static final String RATE_LIMIT_KEY_PREFIX = "rate_limit:";

    // ── Executor Bean Names ───────────────────────────────────────────────────
    public static final String EXECUTOR_SEARCH = "searchExecutor";
    public static final String EXECUTOR_LOG    = "logExecutor";

    // ── API Paths ─────────────────────────────────────────────────────────────
    public static final String PATH_HEALTH       = "/health";
    public static final String PATH_PING         = "/ping";
    public static final String PATH_SWAGGER_UI   = "/swagger-ui";
    public static final String PATH_API_DOCS     = "/api-docs";
    public static final String PATH_SEARCHES     = "/api/v1/searches";
    public static final String PATH_SEARCH       = "/api/v1/search";
    public static final String PATH_SAVED_SEARCH = "/api/v1/search/saved";
}