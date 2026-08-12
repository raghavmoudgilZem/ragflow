package com.ragflow.retrieval.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.ragflow.retrieval.dto.request.Chunk;
import com.ragflow.retrieval.util.chunk.ChunkStrategy;
import com.ragflow.retrieval.util.chunk.NaiveChunkStrategy;

/**
 * The dispatcher is deliberately forgiving at runtime and strict at startup: an
 * unknown parser_id on a job falls back to "naive" rather than failing the job,
 * but two strategies claiming one id, or a missing default, fail the context so
 * the misconfiguration is found at deploy time rather than mid-pipeline.
 */
class DocumentChunkerTest {

    /** Records what it was asked to chunk so dispatch can be asserted. */
    private static final class RecordingStrategy implements ChunkStrategy {

        private final String parserId;
        private String lastText;
        private Map<String, Object> lastConfig;

        private RecordingStrategy(String parserId) {
            this.parserId = parserId;
        }

        @Override
        public String parserId() {
            return parserId;
        }

        @Override
        public List<Chunk> chunk(String text, Map<String, Object> parserConfig) {
            this.lastText = text;
            this.lastConfig = parserConfig;
            return List.of(new Chunk(0, parserId + ":" + text, 1));
        }
    }

    private static RecordingStrategy naive() {
        return new RecordingStrategy(NaiveChunkStrategy.PARSER_ID);
    }

    // --------------------------------------------------------------- dispatch

    @Test
    void dispatchesToTheStrategyMatchingTheParserId() {
        RecordingStrategy naive = naive();
        RecordingStrategy laws = new RecordingStrategy("laws");
        DocumentChunker chunker = new DocumentChunker(List.of(naive, laws));

        List<Chunk> chunks = chunker.chunk("laws", "text", Map.of("k", "v"));

        assertThat(chunks).singleElement().extracting(Chunk::content).isEqualTo("laws:text");
        assertThat(laws.lastText).isEqualTo("text");
        assertThat(laws.lastConfig).containsEntry("k", "v");
        assertThat(naive.lastText).isNull();
    }

    @Test
    void matchesParserIdCaseInsensitively() {
        RecordingStrategy laws = new RecordingStrategy("laws");
        DocumentChunker chunker = new DocumentChunker(List.of(naive(), laws));

        // parser_id casing comes from upstream data and must not decide routing.
        assertThat(chunker.chunk("LAWS", "text", Map.of())).singleElement()
                .extracting(Chunk::content).isEqualTo("laws:text");
    }

    @Test
    void registersStrategiesDeclaringAMixedCaseParserId() {
        RecordingStrategy paper = new RecordingStrategy("Paper");
        DocumentChunker chunker = new DocumentChunker(List.of(naive(), paper));

        assertThat(chunker.chunk("paper", "text", Map.of())).singleElement()
                .extracting(Chunk::content).isEqualTo("Paper:text");
    }

    @Test
    void passesParserConfigThroughUntouchedIncludingNull() {
        RecordingStrategy naive = naive();
        DocumentChunker chunker = new DocumentChunker(List.of(naive));

        chunker.chunk("naive", "text", null);

        // Strategies are documented to handle a null config themselves; the
        // dispatcher must not substitute a default and hide that.
        assertThat(naive.lastConfig).isNull();
    }

    // --------------------------------------------------------------- fallback

    @Test
    void fallsBackToNaiveForAnUnregisteredParserId() {
        RecordingStrategy naive = naive();
        DocumentChunker chunker = new DocumentChunker(List.of(naive));

        // An unknown chunk method degrades to general chunking rather than
        // failing the job — the document still gets indexed.
        assertThat(chunker.chunk("book", "text", Map.of())).singleElement()
                .extracting(Chunk::content).isEqualTo("naive:text");
        assertThat(naive.lastText).isEqualTo("text");
    }

    @Test
    void fallsBackToNaiveForANullParserId() {
        RecordingStrategy naive = naive();
        DocumentChunker chunker = new DocumentChunker(List.of(naive));

        assertThat(chunker.chunk(null, "text", Map.of())).singleElement()
                .extracting(Chunk::content).isEqualTo("naive:text");
    }

    // --------------------------------------------------------- startup checks

    @Test
    void refusesToStartWithoutTheDefaultStrategy() {
        // Without "naive" there is nothing to fall back to, so an unknown
        // parser_id would NPE per job instead of failing once, at startup.
        assertThatThrownBy(() -> new DocumentChunker(List.of(new RecordingStrategy("laws"))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("naive");
    }

    @Test
    void refusesToStartWhenTwoStrategiesClaimTheSameParserId() {
        List<ChunkStrategy> duplicates = List.of(naive(), naive());

        // Silently dropping one would make chunking depend on bean order.
        assertThatThrownBy(() -> new DocumentChunker(duplicates))
                .isInstanceOf(IllegalStateException.class);
    }
}
