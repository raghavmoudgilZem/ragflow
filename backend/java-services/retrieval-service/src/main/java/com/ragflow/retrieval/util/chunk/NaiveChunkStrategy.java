package com.ragflow.retrieval.util.chunk;

import com.ragflow.retrieval.dto.request.Chunk;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * The "naive" (General) chunk method: split the text on a delimiter and greedily
 * pack segments into chunks up to a token budget. A single segment larger than
 * the budget becomes its own chunk rather than being truncated.
 */
@Component
public class NaiveChunkStrategy implements ChunkStrategy {

    public static final String PARSER_ID = "naive";

    private static final int DEFAULT_CHUNK_TOKEN_SIZE = 512;
    private static final String DEFAULT_DELIMITER = "\n";

    @Override
    public String parserId() {
        return PARSER_ID;
    }

    @Override
    public List<Chunk> chunk(String text, Map<String, Object> parserConfig) {
        int chunkTokenSize = intConfig(parserConfig, "chunkTokenSize", DEFAULT_CHUNK_TOKEN_SIZE);
        String delimiter = stringConfig(parserConfig, "delimiter", DEFAULT_DELIMITER);

        String[] segments = text.split(Pattern.quote(delimiter));

        List<Chunk> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        int currentTokens = 0;
        int chunkIndex = 0;

        for (String segment : segments) {
            String trimmed = segment.strip();
            if (trimmed.isEmpty()) {
                continue;
            }

            int segmentTokens = approxTokenCount(trimmed);

            // Flush the current chunk if adding this segment would exceed
            // the configured budget (and we already have content).
            if (currentTokens > 0 && currentTokens + segmentTokens > chunkTokenSize) {
                chunks.add(new Chunk(chunkIndex++, current.toString().strip(), currentTokens));
                current.setLength(0);
                currentTokens = 0;
            }

            if (current.length() > 0) {
                current.append(delimiter.isEmpty() ? " " : delimiter);
            }
            current.append(trimmed);
            currentTokens += segmentTokens;

            // A single oversized segment becomes its own chunk rather than
            // being silently truncated.
            if (currentTokens >= chunkTokenSize) {
                chunks.add(new Chunk(chunkIndex++, current.toString().strip(), currentTokens));
                current.setLength(0);
                currentTokens = 0;
            }
        }

        if (current.length() > 0) {
            chunks.add(new Chunk(chunkIndex, current.toString().strip(), currentTokens));
        }

        return chunks;
    }

    /** Cheap approximation: whitespace-delimited word count. */
    private int approxTokenCount(String s) {
        if (s.isBlank()) return 0;
        return s.trim().split("\\s+").length;
    }

    private int intConfig(Map<String, Object> config, String key, int fallback) {
        if (config == null || !config.containsKey(key)) return fallback;
        Object v = config.get(key);
        if (v instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(String.valueOf(v));
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private String stringConfig(Map<String, Object> config, String key, String fallback) {
        if (config == null || !config.containsKey(key)) return fallback;
        Object v = config.get(key);
        return v == null ? fallback : String.valueOf(v);
    }
}
