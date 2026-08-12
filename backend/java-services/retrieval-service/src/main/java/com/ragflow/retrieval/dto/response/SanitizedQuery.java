package com.ragflow.retrieval.dto.response;

/**
 * Output of QuerySanitizer#sanitize(String).
 * <p>
 * Keyword search and vector search need different treatments of the same raw
 * text, so this carries three views instead of one "cleaned" string:
 * - forKeywordSearch: ES/Lucene special characters escaped + lowercased —
 * safe to drop into a query_string / simple_query_string expression (254).
 * - forEmbedding: trimmed and length-capped ONLY. Casing and characters are
 * left untouched so the embedding model receives semantically intact text
 * (255). Escaping "C++" into "c\+\+" here would corrupt what gets embedded.
 * - original: the trimmed input, untouched otherwise — for logs, audit, and
 * "here's what you searched for" display.
 */
public record SanitizedQuery(
        String forKeywordSearch,
        String forEmbedding,
        String original
) {
}