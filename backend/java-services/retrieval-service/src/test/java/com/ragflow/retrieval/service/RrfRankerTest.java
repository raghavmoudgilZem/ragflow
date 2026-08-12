package com.ragflow.retrieval.service;

import com.ragflow.retrieval.config.RetrievalProperties;
import com.ragflow.retrieval.dto.RankedChunk;
import com.ragflow.retrieval.dto.ScoredChunk;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

/**
 * Unit tests for {@link RrfRanker}.
 *
 * <p>The ranker is constructed directly, without a Spring context.
 */
class RrfRankerTest {

    private static final double EPS = 1e-9;

    private final RrfRanker ranker = new RrfRanker(new RetrievalProperties(
            new RetrievalProperties.Rrf(60),
            new RetrievalProperties.Rerank("http://localhost:9380", 2000, 4000, 50),
            new RetrievalProperties.Sanitize(1000)));

    // ------------------------------------------------------------------
    // Empty results
    // ------------------------------------------------------------------

    @Test
    @DisplayName("Both lists empty -> empty list, no exception")
    void bothListsEmpty_returnsEmptyListNoException() {
        assertThat(ranker.fuse(List.of(), List.of())).isEmpty();
    }

    // ------------------------------------------------------------------
    // Core arithmetic — hand-verified, not formula-mirroring
    // ------------------------------------------------------------------

    @Test
    @DisplayName("3-chunk worked example: top-2 on BOTH signals beats #1 on one signal")
    void threeChunkWorkedExample_rewardsConsistentRankingAcrossBothLists() {
        // Keyword (BM25) order: A, B, C — A wins on keywords
        List<ScoredChunk> keyword = List.of(chunk("A", 15.2), chunk("B", 12.1), chunk("C", 9.8));
        // Vector (kNN) order: B, C, A — A comes LAST on vectors
        List<ScoredChunk> vector = List.of(chunk("B", 0.91), chunk("C", 0.87), chunk("A", 0.79));

        List<RankedChunk> result = ranker.fuse(keyword, vector, 60);

        // Hand-calculated with k = 60 (independent arithmetic, not the
        // production formula re-run):
        //   A: 1/61 + 1/63 = 0.01639344... + 0.01587302... = 0.03226646...
        //   B: 1/62 + 1/61 = 0.01612903... + 0.01639344... = 0.03252247...
        //   C: 1/63 + 1/62 = 0.01587302... + 0.01612903... = 0.03200205...
        // B wins despite never ranking #1 anywhere, because it placed top-2
        // on BOTH signals — the exact behavior RRF exists to produce.
        assertThat(result).extracting(RankedChunk::chunkId).containsExactly("B", "A", "C");

        RankedChunk b = result.get(0);
        assertThat(b.rrfScore()).isCloseTo(0.0325224748810153, within(EPS));
        assertThat(b.keywordRank()).isEqualTo(2);
        assertThat(b.vectorRank()).isEqualTo(1);
        assertThat(b.rawBm25Score()).isEqualTo(12.1);
        assertThat(b.rawVectorScore()).isEqualTo(0.91);
        assertThat(b.rerankScore()).isNull();     // rerank stage has not run

        RankedChunk a = result.get(1);
        assertThat(a.rrfScore()).isCloseTo(1.0 / 61 + 1.0 / 63, within(EPS));

        RankedChunk c = result.get(2);
        assertThat(c.rrfScore()).isCloseTo(1.0 / 63 + 1.0 / 62, within(EPS));
    }

    // ------------------------------------------------------------------
    // Single-list membership -> null fields for the absent signal
    // ------------------------------------------------------------------

    @Test
    @DisplayName("Chunk only in keyword list -> vector fields stay null")
    void chunkOnlyInKeywordList_vectorFieldsStayNull() {
        List<ScoredChunk> keyword = List.of(chunk("X", 1.0), chunk("Y", 2.0), chunk("Z", 3.0));

        RankedChunk z = find(ranker.fuse(keyword, List.of()), "Z");   // rank 3

        assertThat(z.rrfScore()).isCloseTo(1.0 / 63, within(EPS));
        assertThat(z.keywordRank()).isEqualTo(3);
        assertThat(z.rawBm25Score()).isEqualTo(3.0);
        assertThat(z.rawVectorScore()).isNull();
        assertThat(z.vectorRank()).isNull();
    }

    @Test
    @DisplayName("Chunk only in vector list -> keyword fields stay null")
    void chunkOnlyInVectorList_keywordFieldsStayNull() {
        RankedChunk x = find(ranker.fuse(List.of(), List.of(chunk("X", 0.9))), "X");

        assertThat(x.rrfScore()).isCloseTo(1.0 / 61, within(EPS));
        assertThat(x.vectorRank()).isEqualTo(1);
        assertThat(x.rawBm25Score()).isNull();
        assertThat(x.keywordRank()).isNull();
    }

    // ------------------------------------------------------------------
    // Both lists -> contributions SUMMED, not maxed
    // ------------------------------------------------------------------

    @Test
    @DisplayName("Chunk in both lists: contributions are summed, not maxed")
    void chunkInBothLists_rrfContributionsAreSummedNotMaxed() {
        List<ScoredChunk> keyword = List.of(chunk("X", 1.0));                   // X: rank 1
        List<ScoredChunk> vector = List.of(chunk("Y", 1.0), chunk("X", 1.0));   // X: rank 2

        RankedChunk x = find(ranker.fuse(keyword, vector), "X");

        assertThat(x.rrfScore()).isCloseTo(1.0 / 61 + 1.0 / 62, within(EPS));
        assertThat(x.keywordRank()).isEqualTo(1);
        assertThat(x.vectorRank()).isEqualTo(2);
    }

    // ------------------------------------------------------------------
    // AC: k parameterization
    // ------------------------------------------------------------------

    @Test
    @DisplayName("k is genuinely parameterized — explicit overload overrides the default")
    void kIsGenuinelyParameterized_notHardcodedOrCached() {
        List<ScoredChunk> keyword = List.of(chunk("X", 1.0));

        assertThat(find(ranker.fuse(keyword, List.of(), 60), "X").rrfScore())
                .isCloseTo(1.0 / 61, within(EPS));
        assertThat(find(ranker.fuse(keyword, List.of(), 10), "X").rrfScore())
                .isCloseTo(1.0 / 11, within(EPS));
        // and the two-arg form still uses the constructor default (60)
        assertThat(find(ranker.fuse(keyword, List.of()), "X").rrfScore())
                .isCloseTo(1.0 / 61, within(EPS));
    }

    // ------------------------------------------------------------------
    // Determinism
    // ------------------------------------------------------------------

    @Test
    @DisplayName("Tied rrfScores break deterministically by chunkId ascending")
    void tiedRrfScores_breakDeterministicallyByChunkId() {
        // Each singleton list ranks its one chunk #1, so both land on an
        // identical rrfScore of 1/61 — a genuine tie.
        List<RankedChunk> result =
                ranker.fuse(List.of(chunk("Z", 1.0)), List.of(chunk("A", 1.0)));

        assertThat(result).extracting(RankedChunk::chunkId).containsExactly("A", "Z");
    }

    @Test
    @DisplayName("Output order is rrfScore descending")
    void outputSortedByRrfScoreDescending() {
        List<ScoredChunk> keyword =
                List.of(chunk("A", 1.0), chunk("B", 1.0), chunk("C", 1.0));

        List<RankedChunk> result = ranker.fuse(keyword, List.of());

        assertThat(result).extracting(RankedChunk::rrfScore)
                .isSortedAccordingTo((s1, s2) -> Double.compare(s2, s1));
    }

    // ------------------------------------------------------------------
    // Validation / error contract
    // ------------------------------------------------------------------

    @Test
    @DisplayName("k < 1 rejected on the explicit-k overload too")
    void nonPositiveK_rejectedOnExplicitFuseOverloadToo() {
        assertThatThrownBy(() -> ranker.fuse(List.of(), List.of(), 0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Null lists rejected fast with a clear message")
    void nullLists_rejectedFastWithClearMessage() {
        assertThatThrownBy(() -> ranker.fuse(null, List.of()))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("keywordResults");
        assertThatThrownBy(() -> ranker.fuse(List.of(), null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("vectorResults");
    }

    // ------------------------------------------------------------------
    // helpers
    // ------------------------------------------------------------------

    private RankedChunk find(List<RankedChunk> results, String chunkId) {
        return results.stream()
                .filter(c -> c.chunkId().equals(chunkId))
                .findFirst()
                .orElseThrow(() -> new AssertionError("chunk not found: " + chunkId));
    }

    private ScoredChunk chunk(String id, double score) {
        return new ScoredChunk(id, "doc-" + id, "kb-1", "content for " + id, score);
    }
}
