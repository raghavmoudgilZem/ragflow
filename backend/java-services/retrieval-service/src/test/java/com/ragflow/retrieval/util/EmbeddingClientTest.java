package com.ragflow.retrieval.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.ExpectedCount.twice;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.ragflow.retrieval.dto.response.EmbeddingModelResponse;
import com.ragflow.retrieval.exception.EmbeddingServiceException;
import com.ragflow.retrieval.service.GeminiEmbeddingService;

/**
 * The wire conversation with the embedding service.
 *
 * <p>{@link MockRestServiceServer} needs the {@code RestClient.Builder} the
 * client will use, but {@code EmbeddingClient} builds its own inside the
 * constructor — so the bound client is injected over that field afterwards.
 * Everything else about the object, notably the batch size, comes from the real
 * constructor.
 *
 * <p>The response-length assertions matter beyond bookkeeping: a batch whose
 * response length does not match its request length means vectors can no longer
 * be matched to their texts by position, and the client must refuse rather than
 * return a misaligned list.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EmbeddingClientTest {

    private static final String BASE_URL = "http://embedding.test";
    private static final String MODEL_ID = "gemini-embedding-001";

    @Mock
    private GeminiEmbeddingService geminiEmbeddingService;

    private MockRestServiceServer server;

    /** Builds a client whose transport is intercepted, with the given batch size. */
    private EmbeddingClient client(int batchSize) {
        EmbeddingClient client = new EmbeddingClient(BASE_URL, batchSize, 1000L, geminiEmbeddingService);

        RestClient.Builder builder = RestClient.builder().baseUrl(BASE_URL);
        server = MockRestServiceServer.bindTo(builder).build();
        ReflectionTestUtils.setField(client, "restClient", builder.build());

        return client;
    }

    private static String vectorsJson(int count, int dim) {
        StringBuilder json = new StringBuilder("{\"embeddings\": [");
        for (int i = 0; i < count; i++) {
            if (i > 0) json.append(",");
            json.append("[");
            for (int d = 0; d < dim; d++) {
                if (d > 0) json.append(",");
                json.append(i).append(".0");
            }
            json.append("]");
        }
        return json.append("]}").toString();
    }

    // ------------------------------------------------------------------ embed

    @Test
    void embed_sendsModelAndInputTexts() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embeddings"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.model").value(MODEL_ID))
                .andExpect(jsonPath("$.input[0]").value("alpha"))
                .andExpect(jsonPath("$.input[1]").value("beta"))
                .andRespond(withSuccess(vectorsJson(2, 3), MediaType.APPLICATION_JSON));

        List<float[]> vectors = client.embed(MODEL_ID, List.of("alpha", "beta"));

        assertThat(vectors).hasSize(2);
        assertThat(vectors.get(0)).containsExactly(0f, 0f, 0f);
        assertThat(vectors.get(1)).containsExactly(1f, 1f, 1f);
        server.verify();
    }

    @Test
    void embed_splitsInputIntoBatchesOfTheConfiguredSize() {
        EmbeddingClient client = client(2);
        // Five texts at batch size 2 means 2 + 2 + 1.
        server.expect(twice(), requestTo(BASE_URL + "/v1/embeddings"))
                .andRespond(withSuccess(vectorsJson(2, 2), MediaType.APPLICATION_JSON));
        server.expect(requestTo(BASE_URL + "/v1/embeddings"))
                .andRespond(withSuccess(vectorsJson(1, 2), MediaType.APPLICATION_JSON));

        List<float[]> vectors = client.embed(MODEL_ID, List.of("a", "b", "c", "d", "e"));

        // Batching is invisible to the caller: one vector per input text, in
        // input order.
        assertThat(vectors).hasSize(5);
        server.verify();
    }

    @Test
    void embed_makesNoCallForAnEmptyInput() {
        EmbeddingClient client = client(2);

        assertThat(client.embed(MODEL_ID, List.of())).isEmpty();

        // No batches means no request at all — the mock server would fail on
        // any unexpected call.
        server.verify();
    }

    @Test
    void embed_rejectsAResponseWithTooFewVectors() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embeddings"))
                .andRespond(withSuccess(vectorsJson(1, 3), MediaType.APPLICATION_JSON));

        // Two texts in, one vector back: position no longer identifies a text,
        // so returning the short list would corrupt the index.
        assertThatThrownBy(() -> client.embed(MODEL_ID, List.of("alpha", "beta")))
                .isInstanceOf(EmbeddingServiceException.class)
                .hasMessageContaining("1 vectors for a batch of 2");
    }

    @Test
    void embed_rejectsAResponseWithTooManyVectors() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embeddings"))
                .andRespond(withSuccess(vectorsJson(3, 3), MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.embed(MODEL_ID, List.of("alpha", "beta")))
                .isInstanceOf(EmbeddingServiceException.class)
                .hasMessageContaining("3 vectors for a batch of 2");
    }

    @Test
    void embed_rejectsAnEmptyResponseBody() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embeddings"))
                .andRespond(withSuccess());

        assertThatThrownBy(() -> client.embed(MODEL_ID, List.of("alpha")))
                .isInstanceOf(EmbeddingServiceException.class)
                .hasMessageContaining("no vectors for a batch of 1");
    }

    @Test
    void embed_rejectsAResponseWithoutAnEmbeddingsField() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embeddings"))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        // Same typed failure as an empty body: a JSON object with no embeddings
        // field is a protocol error, and describing it must not itself throw.
        assertThatThrownBy(() -> client.embed(MODEL_ID, List.of("alpha")))
                .isInstanceOf(EmbeddingServiceException.class)
                .hasMessageContaining("no vectors for a batch of 1");
    }

    // ----------------------------------------------------------------- exists

    @Test
    void exists_sendsTheModelIdAndReturnsStatusWithDimension() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embed-model/status"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.llmName").value(MODEL_ID))
                .andRespond(withSuccess("{\"status\": true, \"dim\": 768}", MediaType.APPLICATION_JSON));

        EmbeddingModelResponse response = client.exists(MODEL_ID);

        // The dimension is not incidental: the caller records it as the KB's
        // vector_dim, so it has to survive the round trip alongside status.
        assertThat(response.existStatus()).isTrue();
        assertThat(response.dimension()).isEqualTo(768);
        server.verify();
    }

    @Test
    void exists_reportsAnUnregisteredModelAsFalseWithoutFailing() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embed-model/status"))
                .andRespond(withSuccess("{\"status\": false}", MediaType.APPLICATION_JSON));

        // A known-absent model is a plain false, not an error: the caller turns
        // it into a 400.
        assertThat(client.exists("no-such-model").existStatus()).isFalse();
    }

    @Test
    void exists_acceptsAResponseWithoutADimension() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embed-model/status"))
                .andRespond(withSuccess("{\"status\": true}", MediaType.APPLICATION_JSON));

        // Only status is validated here, so a missing dim passes through as
        // null; IndexJobService rejects it when registering a new KB.
        assertThat(client.exists(MODEL_ID).dimension()).isNull();
    }

    @Test
    void exists_failsWhenTheServiceOmitsTheStatus() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embed-model/status"))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        // Absent status is unknown, not "no" — treating it as false would
        // reject valid submissions whenever the service changes its payload.
        assertThatThrownBy(() -> client.exists(MODEL_ID))
                .isInstanceOf(EmbeddingServiceException.class);
    }

    @Test
    void exists_propagatesServerErrors() {
        EmbeddingClient client = client(10);
        server.expect(requestTo(BASE_URL + "/v1/embed-model/status"))
                .andRespond(withServerError());

        assertThatThrownBy(() -> client.exists(MODEL_ID)).isInstanceOf(Exception.class);
    }

    // ------------------------------------------------------------ geminiEmbed

    @Test
    void geminiEmbed_convertsEachTextToAFloatVectorInOrder() {
        EmbeddingClient client = client(10);
        when(geminiEmbeddingService.getEmbedding("alpha")).thenReturn(List.of(0.1d, 0.2d));
        when(geminiEmbeddingService.getEmbedding("beta")).thenReturn(List.of(0.3d, 0.4d));

        List<float[]> vectors = client.geminiEmbed(MODEL_ID, List.of("alpha", "beta"));

        assertThat(vectors).hasSize(2);
        assertThat(vectors.get(0)).containsExactly(0.1f, 0.2f);
        assertThat(vectors.get(1)).containsExactly(0.3f, 0.4f);
    }

    @Test
    void geminiEmbed_callsGeminiOncePerTextAndNeverTheEmbeddingService() {
        EmbeddingClient client = client(10);
        when(geminiEmbeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1d));

        client.geminiEmbed(MODEL_ID, List.of("a", "b", "c"));

        // One call per text, un-batched — and this path bypasses the HTTP
        // embedding service entirely, so any request reaching the mock server
        // would fail the test.
        verify(geminiEmbeddingService, times(3)).getEmbedding(anyString());
        server.verify();
    }

    @Test
    void geminiEmbed_ignoresTheRequestedModelId() {
        EmbeddingClient client = client(10);
        when(geminiEmbeddingService.getEmbedding(anyString())).thenReturn(List.of(0.1d));

        client.geminiEmbed("some-other-model", List.of("a"));

        // Pinned because it is surprising and consequential: the argument is
        // unused, so every job embeds with the one globally configured Gemini
        // model regardless of what was validated and registered for the KB.
        verify(geminiEmbeddingService).getEmbedding("a");
    }

    @Test
    void geminiEmbed_returnsNothingForNoTexts() {
        EmbeddingClient client = client(10);

        assertThat(client.geminiEmbed(MODEL_ID, List.of())).isEmpty();

        verifyNoInteractions(geminiEmbeddingService);
    }

    @Test
    void geminiEmbed_propagatesGeminiFailures() {
        EmbeddingClient client = client(10);
        when(geminiEmbeddingService.getEmbedding(anyString()))
                .thenThrow(new IllegalStateException("gemini unavailable"));

        // The worker relies on this surfacing so the job is marked FAILED.
        assertThatThrownBy(() -> client.geminiEmbed(MODEL_ID, List.of("alpha")))
                .isInstanceOf(IllegalStateException.class);
    }
}
