package com.ragflow.retrieval.util.chunk;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.ragflow.retrieval.dto.request.Chunk;

/**
 * Chunk boundaries decide what a retrieved passage looks like, so the packing
 * rules are pinned here rather than left implicit: segments are packed greedily
 * up to the token budget, an oversized segment is never truncated, and blank
 * segments never become chunks.
 *
 * <p>Token counts are a whitespace word-count approximation, not real tokenizer
 * output — the assertions below encode that approximation, so replacing it with
 * a real tokenizer is expected to change these numbers.
 */
class NaiveChunkStrategyTest {

    private final NaiveChunkStrategy strategy = new NaiveChunkStrategy();

    private static Map<String, Object> config(Object... keysAndValues) {
        Map<String, Object> config = new HashMap<>();
        for (int i = 0; i < keysAndValues.length; i += 2) {
            config.put(String.valueOf(keysAndValues[i]), keysAndValues[i + 1]);
        }
        return config;
    }

    @Test
    void declaresTheNaiveParserId() {
        assertThat(strategy.parserId()).isEqualTo(NaiveChunkStrategy.PARSER_ID).isEqualTo("naive");
    }

    // ---------------------------------------------------------------- packing

    @Test
    void packsEverythingIntoOneChunkWhenItFitsTheBudget() {
        List<Chunk> chunks = strategy.chunk("alpha beta\ngamma delta", config("chunkTokenSize", 100));

        assertThat(chunks).singleElement().satisfies(chunk -> {
            assertThat(chunk.index()).isZero();
            assertThat(chunk.content()).isEqualTo("alpha beta\ngamma delta");
            assertThat(chunk.tokenCount()).isEqualTo(4);
        });
    }

    @Test
    void flushesTheCurrentChunkBeforeASegmentThatWouldOverflowIt() {
        // Budget 3: "a b" (2) + "c d" (2) would be 4, so the first chunk closes
        // at "a b" and the next segment starts a fresh one.
        List<Chunk> chunks = strategy.chunk("a b\nc d\ne", config("chunkTokenSize", 3));

        assertThat(chunks).hasSize(2);
        assertThat(chunks.get(0).content()).isEqualTo("a b");
        assertThat(chunks.get(0).tokenCount()).isEqualTo(2);
        // "c d" + "e" hits exactly 3 and closes on the budget.
        assertThat(chunks.get(1).content()).isEqualTo("c d\ne");
        assertThat(chunks.get(1).tokenCount()).isEqualTo(3);
    }

    @Test
    void keepsAnOversizedSegmentWholeRatherThanTruncatingIt() {
        List<Chunk> chunks = strategy.chunk("one two three four five", config("chunkTokenSize", 2));

        // A single segment over budget is emitted intact — losing text would be
        // worse than an oversized chunk.
        assertThat(chunks).singleElement().satisfies(chunk -> {
            assertThat(chunk.content()).isEqualTo("one two three four five");
            assertThat(chunk.tokenCount()).isEqualTo(5);
        });
    }

    @Test
    void numbersChunksSequentiallyFromZero() {
        List<Chunk> chunks = strategy.chunk("a\nb\nc\nd", config("chunkTokenSize", 1));

        // The worker uses index() to look up a chunk's vector, so a gap or a
        // repeat here mis-pairs vectors with text.
        assertThat(chunks).extracting(Chunk::index).containsExactly(0, 1, 2, 3);
    }

    @Test
    void emitsTheTrailingPartialChunk() {
        List<Chunk> chunks = strategy.chunk("a b\nc", config("chunkTokenSize", 2));

        assertThat(chunks).hasSize(2);
        assertThat(chunks.get(1).content()).isEqualTo("c");
        assertThat(chunks.get(1).tokenCount()).isEqualTo(1);
    }

    // --------------------------------------------------------------- cleaning

    @Test
    void dropsBlankSegments() {
        List<Chunk> chunks = strategy.chunk("alpha\n\n   \nbeta", config("chunkTokenSize", 100));

        // Blank lines are formatting, not content: an empty chunk would embed
        // to noise and pollute results.
        assertThat(chunks).singleElement().satisfies(chunk -> {
            assertThat(chunk.content()).isEqualTo("alpha\nbeta");
            assertThat(chunk.tokenCount()).isEqualTo(2);
        });
    }

    @Test
    void stripsSurroundingWhitespaceFromSegments() {
        List<Chunk> chunks = strategy.chunk("  alpha  \n  beta  ", config("chunkTokenSize", 100));

        assertThat(chunks).singleElement().extracting(Chunk::content).isEqualTo("alpha\nbeta");
    }

    @Test
    void returnsNoChunksForEmptyText() {
        // The worker treats an empty chunk list as a successful no-op job, so
        // this must be an empty list rather than one blank chunk.
        assertThat(strategy.chunk("", config())).isEmpty();
    }

    @Test
    void returnsNoChunksForWhitespaceOnlyText() {
        assertThat(strategy.chunk("   \n\n  \n", config())).isEmpty();
    }

    // ----------------------------------------------------------- parserConfig

    @Test
    void appliesDefaultsWhenConfigIsNull() {
        List<Chunk> chunks = strategy.chunk("alpha\nbeta", null);

        // Default budget is 512 tokens and the default delimiter a newline.
        assertThat(chunks).singleElement().extracting(Chunk::content).isEqualTo("alpha\nbeta");
    }

    @Test
    void appliesDefaultsWhenConfigIsEmpty() {
        assertThat(strategy.chunk("alpha\nbeta", Map.of()))
                .singleElement().extracting(Chunk::content).isEqualTo("alpha\nbeta");
    }

    @Test
    void splitsOnTheConfiguredDelimiter() {
        List<Chunk> chunks = strategy.chunk("a|b|c", config("delimiter", "|", "chunkTokenSize", 2));

        assertThat(chunks).hasSize(2);
        assertThat(chunks.get(0).content()).isEqualTo("a|b");
        assertThat(chunks.get(1).content()).isEqualTo("c");
    }

    @Test
    void treatsTheDelimiterAsLiteralTextNotARegex() {
        // "." would match every character if it were compiled as a pattern.
        List<Chunk> chunks = strategy.chunk("alpha.beta", config("delimiter", ".", "chunkTokenSize", 100));

        assertThat(chunks).singleElement().extracting(Chunk::content).isEqualTo("alpha.beta");
        assertThat(chunks.get(0).tokenCount()).isEqualTo(2);
    }

    @Test
    void readsNumericConfigGivenAsAString() {
        // parser_config arrives as deserialized JSON, where a number may show
        // up as a string depending on the producer.
        List<Chunk> chunks = strategy.chunk("a b\nc d", config("chunkTokenSize", "2"));

        assertThat(chunks).hasSize(2);
    }

    @Test
    void fallsBackToTheDefaultBudgetForAnUnparseableSize() {
        List<Chunk> chunks = strategy.chunk("a b\nc d", config("chunkTokenSize", "not-a-number"));

        // Garbage config degrades to the default rather than failing the job.
        assertThat(chunks).singleElement().extracting(Chunk::content).isEqualTo("a b\nc d");
    }

    @Test
    void fallsBackToTheDefaultDelimiterForANullValue() {
        Map<String, Object> config = config("chunkTokenSize", 100);
        config.put("delimiter", null);

        assertThat(strategy.chunk("alpha\nbeta", config))
                .singleElement().extracting(Chunk::content).isEqualTo("alpha\nbeta");
    }

    @Test
    void acceptsANumericSizeGivenAsANonIntegerNumber() {
        List<Chunk> chunks = strategy.chunk("a b\nc d", config("chunkTokenSize", 2.9d));

        // Number.intValue() truncates to 2, so this splits.
        assertThat(chunks).hasSize(2);
    }
}
