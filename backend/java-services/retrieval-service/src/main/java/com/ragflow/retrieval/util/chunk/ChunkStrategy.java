package com.ragflow.retrieval.util.chunk;

import com.ragflow.retrieval.dto.request.Chunk;

import java.util.List;
import java.util.Map;

/**
 * A chunking strategy turns already-parsed document text into the ordered list
 * of chunks that will be embedded and indexed. There is one implementation per
 * RagFlow {@code parser_id} (chunk method); {@link #parserId()} is the id it
 * handles ("naive", "one", "laws", ...).
 *
 * <p>Implementations are stateless and Spring-managed. {@link // DocumentChunker
 * com.ragflow.retrieval.util.DocumentChunker} discovers every implementation on
 * the classpath and dispatches by id, so a new chunk method is added simply by
 * dropping a new {@code @Component} in this package — the dispatcher does not
 * change.
 */
public interface ChunkStrategy {

    /** The RagFlow {@code parser_id} this strategy implements, e.g. "naive". */
    String parserId();

    /**
     * Splits parsed text into chunks, in reading order.
     *
     * @param text         the parsed document text for one document
     * @param parserConfig per-job knobs (chunk size, delimiter, ...); may be
     *                     {@code null} or empty, in which case the strategy
     *                     applies its own defaults
     */
    List<Chunk> chunk(String text, Map<String, Object> parserConfig);
}
