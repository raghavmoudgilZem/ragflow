package com.ragflow.retrieval.util;

import com.ragflow.retrieval.dto.request.Chunk;
import com.ragflow.retrieval.util.chunk.ChunkStrategy;
import com.ragflow.retrieval.util.chunk.NaiveChunkStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Dispatches a chunking request to the {@link ChunkStrategy} for the job's
 * {@code parser_id}. Strategies are auto-discovered from the Spring context, so
 * adding a new chunk method means adding a new {@code ChunkStrategy} bean — this
 * class does not change.
 *
 * <p>An unknown {@code parser_id} falls back to {@link NaiveChunkStrategy}
 * rather than failing the job, and the substitution is logged so the choice is
 * visible.
 */
@Component
@Slf4j
public class DocumentChunker {

    private static final String DEFAULT_PARSER_ID = NaiveChunkStrategy.PARSER_ID;

    private final Map<String, ChunkStrategy> strategiesByParserId;

    public DocumentChunker(List<ChunkStrategy> strategies) {
        // Keyed case-insensitively so a job's parser_id casing never matters.
        // toMap throws on duplicate keys, surfacing two strategies claiming the
        // same parser_id at startup rather than silently dropping one.
        this.strategiesByParserId = strategies.stream()
                .collect(Collectors.toMap(
                        s -> s.parserId().toLowerCase(),
                        Function.identity()));

        if (!strategiesByParserId.containsKey(DEFAULT_PARSER_ID)) {
            throw new IllegalStateException(
                    "Default chunk strategy '" + DEFAULT_PARSER_ID + "' is not registered");
        }
    }

    public List<Chunk> chunk(String parserId, String text, Map<String, Object> parserConfig) {
        String key = parserId == null ? DEFAULT_PARSER_ID : parserId.toLowerCase();
        ChunkStrategy strategy = strategiesByParserId.get(key);

        if (strategy == null) {
            log.warn("No chunk strategy registered for parserId '{}'; falling back to '{}'",
                    parserId, DEFAULT_PARSER_ID);
            strategy = strategiesByParserId.get(DEFAULT_PARSER_ID);
        }

        return strategy.chunk(text, parserConfig);
    }
}
