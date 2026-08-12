package com.ragflow.retrieval.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.net.SocketTimeoutException;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ragflow.retrieval.client.RerankClient;
import com.ragflow.retrieval.config.RetrievalProperties;
import com.ragflow.retrieval.exception.RerankClientException;
import com.ragflow.retrieval.dto.RankedChunk;

/**
 * Tests re-ranking behavior against a stub client, so no HTTP appears anywhere
 * below — that is the point of keeping transport behind an interface. It lets the
 * most important guarantee, that a broken provider still returns results, be
 * proven by simply making the stub throw.
 *
 * <p>Those failure tests matter most: they protect a behavior nothing else
 * enforces. If someone later tightens the exception handling in the service, the
 * search quietly starts failing whenever the provider does, and only these tests
 * will notice.
 */
@ExtendWith(MockitoExtension.class)
class RerankServiceTest {

    private static final int DEFAULT_TOP_N = 50;
    private static final String QUERY = "what is retrieval augmented generation";

    @Mock
    private RerankClient rerankClient;

    // ---------------------------------------------------------------- helpers

    private RerankService service(int topN) {
        // Only top-n steers behaviour here; the transport settings are irrelevant
        // to this suite because the client is a stub.
        return new RerankService(rerankClient, new RetrievalProperties(
                new RetrievalProperties.Rrf(60),
                new RetrievalProperties.Rerank("http://rerank.test", 2000, 4000, topN),
                new RetrievalProperties.Sanitize(1000)));
    }

    private static RankedChunk chunk(String id, double rrfScore) {
        return chunk(id, rrfScore, "content of " + id);
    }

    private static RankedChunk chunk(String id, double rrfScore, String content) {
        // Null raw scores and ranks are legitimate: a chunk found by only one of
        // the two searches looks exactly like this.
        return new RankedChunk(id, "doc-" + id, "kb-1", content,
                null, null, null, null, rrfScore, null);
    }

    private static List<String> ids(List<RankedChunk> chunks) {
        return chunks.stream().map(RankedChunk::chunkId).toList();
    }

    // ------------------------------------------------- toggle and empty input

    @Test
    void toggleOff_returnsInputUnchanged_andNeverCallsProvider() {
        List<RankedChunk> in = List.of(chunk("A", 0.9), chunk("B", 0.8));

        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(in, QUERY, false);

        // Asserting the no-call is the actual point, not just the return value.
        verifyNoInteractions(rerankClient);
        assertThat(out).isSameAs(in);
    }

    @Test
    void emptyCandidates_returnsEmpty_andNeverCallsProvider() {
        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(List.of(), QUERY, true);

        verifyNoInteractions(rerankClient);
        assertThat(out).isEmpty();
    }

    // ------------------------------------------------------------- happy path

    @Test
    void happyPath_reordersHeadByProviderScore_andAttachesScoresToCorrectChunks() {
        // RRF order: A, B, C. Provider disagrees: B best, C middle, A worst.
        List<RankedChunk> in = List.of(chunk("A", 0.9), chunk("B", 0.8), chunk("C", 0.7));
        when(rerankClient.score(anyString(), anyList()))
                .thenReturn(new double[]{0.1, 0.9, 0.5});   // index-aligned with A, B, C

        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(in, QUERY, true);

        assertThat(ids(out)).containsExactly("B", "C", "A");
        // Index alignment: each score landed on the chunk it belongs to.
        assertThat(out.get(0).rerankScore()).isEqualTo(0.9);
        assertThat(out.get(1).rerankScore()).isEqualTo(0.5);
        assertThat(out.get(2).rerankScore()).isEqualTo(0.1);
        // Re-ranking re-orders results; it does not erase what fusion worked out.
        // The fusion score survives for diagnostics and tie-breaking.
        assertThat(out.get(0).rrfScore()).isEqualTo(0.8);
    }

    @Test
    void onlyTopNContentsAreSentToProvider_andQueryPassesThroughVerbatim() {
        List<RankedChunk> in = List.of(chunk("A", 0.9), chunk("B", 0.8), chunk("C", 0.7));
        when(rerankClient.score(anyString(), anyList())).thenReturn(new double[]{0.5, 0.4});

        service(2).rerank(in, QUERY, true);

        ArgumentCaptor<String> queryCaptor = ArgumentCaptor.captor();
        ArgumentCaptor<List<String>> textsCaptor = ArgumentCaptor.captor();
        verify(rerankClient).score(queryCaptor.capture(), textsCaptor.capture());

        // Assert on what the stub received: C is beyond the top 2, so its content
        // must never leave the service, and the query must arrive unmodified.
        assertThat(queryCaptor.getValue()).isEqualTo(QUERY);
        assertThat(textsCaptor.getValue())
                .containsExactly("content of A", "content of B");
    }

    @Test
    void tailBeyondTopN_keepsRrfOrder_belowRerankedHead_withNullRerankScore() {
        List<RankedChunk> in = List.of(
                chunk("A", 0.9), chunk("B", 0.8), chunk("C", 0.7), chunk("D", 0.6));
        when(rerankClient.score(anyString(), anyList()))
                .thenReturn(new double[]{0.1, 0.9});        // head = A, B

        List<RankedChunk> out = service(2).rerank(in, QUERY, true);

        // Head re-sorted (B over A); tail C, D untouched and strictly below —
        // even though A's rerank score is tiny, the tail never leapfrogs it.
        assertThat(ids(out)).containsExactly("B", "A", "C", "D");
        assertThat(out.get(2).rerankScore()).isNull();
        assertThat(out.get(3).rerankScore()).isNull();
    }

    @Test
    void fewerCandidatesThanTopN_allAreSent() {
        List<RankedChunk> in = List.of(chunk("A", 0.9), chunk("B", 0.8));
        when(rerankClient.score(anyString(), anyList())).thenReturn(new double[]{0.2, 0.7});

        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(in, QUERY, true);

        ArgumentCaptor<List<String>> textsCaptor = ArgumentCaptor.captor();
        verify(rerankClient).score(anyString(), textsCaptor.capture());
        assertThat(textsCaptor.getValue()).hasSize(2);
        assertThat(ids(out)).containsExactly("B", "A");
    }

    // -------------------------------------------------------------- fail open

    @Test
    void providerThrows_failsOpen_returnsInputUntouched_noExceptionEscapes() {
        List<RankedChunk> in = List.of(chunk("A", 0.9), chunk("B", 0.8));
        when(rerankClient.score(anyString(), anyList())).thenThrow(
                new RerankClientException("read timed out",
                        new SocketTimeoutException("read timed out")));

        // The AC's "Fail Open": the call below must not throw.
        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(in, QUERY, true);

        // Input untouched means untouched — same instance, RRF order, and
        // rerankScore still null on every chunk.
        assertThat(out).isSameAs(in);
        assertThat(out).allSatisfy(c -> assertThat(c.rerankScore()).isNull());
    }

    @Test
    void wrongLengthScoreArray_isAProviderFault_failsOpen_noPartialZip() {
        List<RankedChunk> in = List.of(chunk("A", 0.9), chunk("B", 0.8), chunk("C", 0.7));
        when(rerankClient.score(anyString(), anyList()))
                .thenReturn(new double[]{0.5});             // 1 score, 3 candidates

        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(in, QUERY, true);

        assertThat(out).isSameAs(in);
        assertThat(out).allSatisfy(c -> assertThat(c.rerankScore()).isNull());
    }

    @Test
    void providerThrowsUndeclaredRuntimeException_stillFailsOpen() {
        // A client that fails without wrapping in RerankClientException must not
        // be able to fail the search either — fail-open is a guarantee about the
        // outcome, not about one exception type.
        List<RankedChunk> in = List.of(chunk("A", 0.9), chunk("B", 0.8));
        when(rerankClient.score(anyString(), anyList()))
                .thenThrow(new IllegalStateException("connection pool exhausted"));

        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(in, QUERY, true);

        assertThat(out).isSameAs(in);
        assertThat(out).allSatisfy(c -> assertThat(c.rerankScore()).isNull());
    }

    @Test
    void nullRrfScoreOnCandidate_sortsLast_ratherThanThrowing() {
        // rrfScore is nullable on RankedChunk. An NPE raised inside the sort
        // would land outside the fail-open catch and 500 the whole request.
        List<RankedChunk> in = List.of(
                new RankedChunk("A", "doc-A", "kb-1", "content of A",
                        null, null, null, null, null, null),
                chunk("B", 0.8));
        when(rerankClient.score(anyString(), anyList()))
                .thenReturn(new double[]{0.7, 0.7});        // tie -> falls through to rrfScore

        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(in, QUERY, true);

        // B has a real rrfScore, A's is null and therefore ranks below it.
        assertThat(ids(out)).containsExactly("B", "A");
    }

    // ------------------------------------------------------------ determinism

    @Test
    void tieOnRerankScore_isBrokenByRrfScoreDescending() {
        // Deliberately NOT rrf-descending on input, so the tie-break is
        // distinguishable from mere sort stability: if the comparator ignored
        // rrfScore, stability would keep Y first.
        List<RankedChunk> in = List.of(chunk("Y", 0.60), chunk("X", 0.95));
        when(rerankClient.score(anyString(), anyList()))
                .thenReturn(new double[]{0.7, 0.7});        // exact tie

        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(in, QUERY, true);

        assertThat(ids(out)).containsExactly("X", "Y");
    }

    @Test
    void equalOnBothScores_orderStaysStable() {
        List<RankedChunk> in = List.of(chunk("M", 0.5), chunk("N", 0.5));
        when(rerankClient.score(anyString(), anyList()))
                .thenReturn(new double[]{0.7, 0.7});

        List<RankedChunk> out = service(DEFAULT_TOP_N).rerank(in, QUERY, true);

        // List.sort is stable — equal on both keys keeps insertion order.
        assertThat(ids(out)).containsExactly("M", "N");
    }

    // -------------------------------------------------------------- edge data

    @Test
    void nullChunkContent_isSentAsEmptyString_notAnNpe() {
        List<RankedChunk> in = List.of(
                chunk("A", 0.9, null), chunk("B", 0.8, "content of B"));
        when(rerankClient.score(anyString(), anyList())).thenReturn(new double[]{0.1, 0.9});

        service(DEFAULT_TOP_N).rerank(in, QUERY, true);

        ArgumentCaptor<List<String>> textsCaptor = ArgumentCaptor.captor();
        verify(rerankClient).score(anyString(), textsCaptor.capture());
        assertThat(textsCaptor.getValue()).containsExactly("", "content of B");
    }
}