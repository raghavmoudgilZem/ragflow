package com.ragflow.retrieval.util;

import com.ragflow.retrieval.dto.request.EmbedRequest;
import com.ragflow.retrieval.dto.request.EmbeddingModelRequest;
import com.ragflow.retrieval.dto.response.EmbedResponse;
import com.ragflow.retrieval.dto.response.EmbeddingModelResponse;
import com.ragflow.retrieval.exception.EmbeddingServiceException;
import com.ragflow.retrieval.service.GeminiEmbeddingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Component
public class EmbeddingClient {


    private final RestClient restClient;
    private final int batchSize;
    private final GeminiEmbeddingService geminiEmbeddingService;


    public EmbeddingClient(
            @Value("${rag.embedding-service.base-url}") String baseUrl,
            @Value("${rag.embedding-service.batch-size}") int batchSize,
            @Value("${rag.embedding-service.timeout-ms}") long timeoutMs, GeminiEmbeddingService geminiEmbeddingService) {
        this.batchSize = batchSize;
        this.geminiEmbeddingService = geminiEmbeddingService;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(clientRequestFactory(timeoutMs))
                .build();
    }

    private org.springframework.http.client.ClientHttpRequestFactory clientRequestFactory(long timeoutMs) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) timeoutMs);
        factory.setReadTimeout((int) timeoutMs);
        return factory;
    }

    /**
     * Embeds a list of texts, batching internally. Order of the returned
     * vectors matches the order of the input texts.
     */
    public List<float[]> embed(String embeddingModelId, List<String> texts) {
        List<float[]> results = new ArrayList<>(texts.size());

        for (int start = 0; start < texts.size(); start += batchSize) {
            int end = Math.min(start + batchSize, texts.size());
            List<String> batch = texts.subList(start, end);

            EmbedRequest request = new EmbedRequest(embeddingModelId, batch);
            EmbedResponse response = this.restClient.post()
                    .uri("/v1/embeddings")
                    .body(request)
                    .retrieve()
                    .body(EmbedResponse.class);

            if (response == null || response.embeddings() == null
                    || response.embeddings().size() != batch.size()) {
                // Read the size only once it is known to exist: a body with no
                // embeddings field passes the guard but used to NPE right here,
                // turning a clear protocol error into an opaque one.
                String received = (response == null || response.embeddings() == null)
                        ? "no"
                        : String.valueOf(response.embeddings().size());
                throw new EmbeddingServiceException(
                        "Embedding service returned " + received +
                                " vectors for a batch of " + batch.size());
            }

            results.addAll(response.embeddings());
        }

        return results;
    }


    public EmbeddingModelResponse exists(String embeddingModelId) {
        EmbeddingModelRequest embeddingModelRequest= new EmbeddingModelRequest(embeddingModelId);

        EmbeddingModelResponse response = this.restClient.post()
                .uri("/v1/embed-model/status")
                .body(embeddingModelRequest)
                .retrieve()
                .body(EmbeddingModelResponse.class);

        if (response == null || response.existStatus() == null) {
            throw new EmbeddingServiceException("Embedding service returned: no "+embeddingModelId +"embedding model exist");
        }
        return response;
    }

    public List<float[]> geminiEmbed(String embeddingModelId, List<String> texts) {

        List<float[]> results = new ArrayList<>(texts.size());

        for (String text : texts) {

            List<Double> embedding = geminiEmbeddingService.getEmbedding(text);

            float[] vector = new float[embedding.size()];

            for (int i = 0; i < embedding.size(); i++) {
                vector[i] = embedding.get(i).floatValue();
            }

            results.add(vector);
        }

        return results;
    }
}