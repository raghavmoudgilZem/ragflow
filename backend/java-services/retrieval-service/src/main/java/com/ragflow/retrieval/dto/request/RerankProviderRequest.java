package com.ragflow.retrieval.dto.request;

import java.util.List;

/**
 * Request body sent to the re-rank model provider.
 *
 * <pre>
 * { "query": "what is retrieval augmented generation",
 *   "texts": ["chunk 1 content", "chunk 2 content"] }
 * </pre>
 *
 * <p>The provider scores every entry in {@code texts} against {@code query} and
 * returns one relevance score per text, in the same order.
 *
 * <p>Field names match the JSON keys exactly, so Jackson needs no annotations.
 *
 * @param query the user's question in natural language. Text escaped for keyword
 *              search (for example {@code what\ is\ RAG\?}) makes the model score
 *              badly, and it degrades silently rather than raising an error.
 * @param texts the chunk contents to score, in their current rank order
 */
public record RerankProviderRequest(String query, List<String> texts) {
}
