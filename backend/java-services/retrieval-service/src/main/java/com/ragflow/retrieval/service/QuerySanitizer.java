package com.ragflow.retrieval.service;

import com.ragflow.retrieval.config.RetrievalProperties;
import com.ragflow.retrieval.dto.response.SanitizedQuery;
import com.ragflow.retrieval.exception.InvalidQueryException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Query Pre-processing & Sanitization.
 * <p>
 * Pure, stateless, zero-dependency business logic. No controller, no HTTP
 * endpoint, no DB, no ES/Redis/HTTP calls — this is the mandatory first step
 * for ANY raw query text before it reaches keyword search, vector search, or
 * hybrid orchestration.
 * <p>
 * Callers (all in-process method calls, never HTTP):
 * - HybridSearchOrchestrator — calls sanitize() as its very first line
 * - KeywordSearchService — consumes forKeywordSearch()
 * - VectorSearchService — consumes forEmbedding()
 * - SimulationController — same contract, admin/debug path
 * <p>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class QuerySanitizer {

    /**
     * Reserved Elasticsearch/Lucene query_string operator characters, matching
     * the ticket's acceptance criteria exactly:
     * + - = & | ! ( ) { } [ ] ^ " ~ * ? : \ /
     * <p>
     * && and || don't need their own entries in the character class — escaping
     * & and | individually, wherever they appear (including back-to-back),
     * neutralizes && and || too, since Lucene only reads them as boolean
     * operators when both characters are unescaped and adjacent.
     */
    private static final Pattern ES_SPECIAL_CHARS = Pattern.compile("([+\\-=&|!(){}\\[\\]^\"~*?:\\\\/])");

    /**
     * The bound {@code retrieval.*} config, registered by
     * {@code @ConfigurationPropertiesScan}. Only {@code retrieval.sanitize} is
     * read here (see {@link RetrievalProperties.Sanitize}), reached through at
     * the call site; the cap is bound and validated at startup.
     */
    private final RetrievalProperties retrievalProperties;

    @PostConstruct
    private void logConfig() {
        log.info("QuerySanitizer initialized with max-query-length={}", maxQueryLength());
    }

    public SanitizedQuery sanitize(String rawQuery) {
        // 1 — null check
        if (rawQuery == null) {
            throw new InvalidQueryException("Query text must not be null");
        }

        // 2 — trim leading/trailing whitespace
        String trimmed = rawQuery.trim();

        // 3 — reject whitespace-only input (empty after trim)
        if (trimmed.isEmpty()) {
            throw new InvalidQueryException("Query text must not be empty");
        }

        // 4 — length cap BEFORE escaping. Escaping first and truncating second
        // could slice a string in half in the middle of a backslash-escape
        // sequence, leaving a dangling, unmatched backslash at the tail — an
        // unsafe string to hand to Elasticsearch, which is the exact failure
        // mode this class exists to prevent.
        if (trimmed.length() > maxQueryLength()) {
            log.warn("Query text truncated from {} to {} characters — this should have been " +
                    "rejected by @Size validation at the DTO layer; sanitizer truncation is a " +
                    "defensive fallback only", trimmed.length(), maxQueryLength());
            trimmed = trimmed.substring(0, maxQueryLength());
        }

        // 5 — embedding path: untouched beyond trim/truncate. Case and
        // punctuation carry real semantic weight for a dense embedding model;
        // forcibly escaping or lowercasing here would corrupt the meaning
        // being encoded (e.g. "US" the country vs "us" the pronoun).
        String forEmbedding = trimmed;

        // 6 — keyword/BM25 path: escape reserved characters, then lowercase.
        String forKeywordSearch = escapeForElasticsearch(trimmed).toLowerCase(Locale.ROOT);

        // 7 — return all three views of the same input
        return new SanitizedQuery(forKeywordSearch, forEmbedding, trimmed);
    }

    private int maxQueryLength() {
        return retrievalProperties.sanitize().maxQueryLength();
    }

    private String escapeForElasticsearch(String input) {
        return ES_SPECIAL_CHARS.matcher(input).replaceAll("\\\\$1");
    }
}