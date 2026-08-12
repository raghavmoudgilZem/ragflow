package com.ragflow.retrieval.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.net.ConnectException;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import com.ragflow.retrieval.exception.RerankClientException;

/**
 * Tests the HTTP conversation with the re-rank provider.
 *
 * <p>The counterpart to {@code RerankServiceTest}: that suite never touches HTTP,
 * this one tests nothing else. {@link MockRestServiceServer} intercepts below the
 * client, so the JSON that would go on the wire and the parsing of what comes back
 * are both asserted without opening a socket.
 *
 * <p>Worth knowing about the coverage here: with no real socket, genuine connect
 * and read timeouts cannot occur. The connection-failure test injects the same
 * {@link ResourceAccessException} that the underlying request factory raises on a
 * real timeout or refused connection, which covers the exception mapping this
 * class is responsible for. Whether the configured timeout values are themselves
 * sensible can only be judged against a live provider.
 */
class HttpRerankClientTest {

    private static final String BASE_URL = "http://rerank.test";
    private static final String QUERY = "what is retrieval augmented generation";

    private MockRestServiceServer server;
    private HttpRerankClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl(BASE_URL);
        server = MockRestServiceServer.bindTo(builder).build();
        client = new HttpRerankClient(builder.build());
    }

    // ------------------------------------------------------------ happy path

    @Test
    void sendsExactWireContract_andParsesIndexAlignedScores() {
        server.expect(requestTo(BASE_URL + "/rerank"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                // Field names and array order are the whole protocol here: no ids
                // are exchanged, so position is the only link back to a chunk.
                .andExpect(jsonPath("$.query").value(QUERY))
                .andExpect(jsonPath("$.texts[0]").value("alpha content"))
                .andExpect(jsonPath("$.texts[1]").value("beta content"))
                .andExpect(jsonPath("$.texts.length()").value(2))
                .andRespond(withSuccess("{\"scores\": [0.9, 0.1]}", MediaType.APPLICATION_JSON));

        double[] scores = client.score(QUERY, List.of("alpha content", "beta content"));

        // Index alignment preserved end to end: scores[i] belongs to texts[i].
        assertThat(scores).containsExactly(0.9, 0.1);
        server.verify();
    }

    // ---------------------------------------------- transport/protocol faults
    //
    // Every fault below must surface as RerankClientException and nothing
    // else — that single exception type is the entire contract RerankService
    // fails open on. A leak of RestClientException here would bypass the
    // catch in RerankService and turn "degraded results" into "failed request".

    @Test
    void http500_becomesRerankClientException() {
        server.expect(requestTo(BASE_URL + "/rerank"))
                .andRespond(withServerError());

        assertThatThrownBy(() -> client.score(QUERY, List.of("alpha content")))
                .isInstanceOf(RerankClientException.class);
    }

    @Test
    void emptyResponseBody_becomesRerankClientException() {
        // A 200 with no body deserializes to null. That is a broken provider, not
        // a successful call that happened to score nothing.
        server.expect(requestTo(BASE_URL + "/rerank"))
                .andRespond(withSuccess("", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.score(QUERY, List.of("alpha content")))
                .isInstanceOf(RerankClientException.class)
                .hasMessageContaining("returned no scores");
    }

    @Test
    void bodyWithoutScoresField_becomesRerankClientException() {
        // Valid JSON, wrong shape — e.g. the provider's error envelope leaking
        // through with a 200 status. scores() is null after deserialization.
        server.expect(requestTo(BASE_URL + "/rerank"))
                .andRespond(withSuccess("{\"detail\": \"model loading\"}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.score(QUERY, List.of("alpha content")))
                .isInstanceOf(RerankClientException.class)
                .hasMessageContaining("returned no scores");
    }

    @Test
    void nullScoreEntry_becomesRerankClientException() {
        // Why the response holds Double rather than double: a JSON null has to be
        // detected here. Coerced to 0.0 it would pass as a real "not relevant".
        server.expect(requestTo(BASE_URL + "/rerank"))
                .andRespond(withSuccess("{\"scores\": [0.5, null]}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.score(QUERY, List.of("alpha content", "beta content")))
                .isInstanceOf(RerankClientException.class)
                .hasMessageContaining("null score at position 1");
    }

    @Test
    void connectionFailure_becomesRerankClientException_withCausePreserved() {
        // The request factory raises ResourceAccessException both for a refused
        // connection and for connect/read timeouts, so "provider unreachable" and
        // "provider too slow" reach the service through this same path.
        server.expect(requestTo(BASE_URL + "/rerank"))
                .andRespond(request -> {
                    throw new ResourceAccessException("Connection refused",
                            new ConnectException("Connection refused"));
                });

        assertThatThrownBy(() -> client.score(QUERY, List.of("alpha content")))
                .isInstanceOf(RerankClientException.class)
                .hasCauseInstanceOf(ResourceAccessException.class);
    }
}