package com.ragflow.retrieval.service;

import com.ragflow.retrieval.config.model.gemini.GeminiProperties;
import com.ragflow.retrieval.exception.SearchExecutionException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Generates dense-vector embeddings for search queries via the Google Gemini
 * embedding API.
 */
@Service
@Slf4j
public class GeminiEmbeddingService {

    private final GeminiProperties geminiProperties;
    private final RestTemplate restTemplate;

    public GeminiEmbeddingService(GeminiProperties geminiProperties, RestTemplate restTemplate) {
        this.geminiProperties = geminiProperties;
        this.restTemplate = restTemplate;
    }

    /**
     * Requests an embedding vector for the given text from the Gemini API.
     */
    @SuppressWarnings("unchecked")
    public List<Double> getEmbedding(String text) {
        log.info("START: getEmbedding for text of length {}", text != null ? text.length() : 0);

        if (StringUtils.isBlank(text)) {
            throw new SearchExecutionException("Cannot generate embedding for blank text");
        }

        try {
            String url = buildEmbeddingUrl();
            HttpEntity<Map<String, Object>> request = buildEmbeddingRequest(text);

            log.debug("Calling Gemini embedding API with model '{}'", geminiProperties.embeddingModel());
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            List<Double> embedding = extractEmbeddingValues(response.getBody());
            log.info("END: getEmbedding successfully generated vector with dimension {}", embedding.size());
            return embedding;

        } catch (SearchExecutionException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch embedding from Gemini API", e);
            throw new SearchExecutionException("Failed to fetch embedding from Gemini API", e);
        }
    }

    /**
     * Builds the fully-qualified Gemini "embedContent" endpoint URL.
     */
    private String buildEmbeddingUrl() {
        return String.format("%s/models/%s:embedContent?key=%s",
                geminiProperties.embeddingUrl(), geminiProperties.embeddingModel(), geminiProperties.apiKey());
    }

    /**
     * Builds the JSON request payload expected by the Gemini embedContent endpoint.
     */
    private HttpEntity<Map<String, Object>> buildEmbeddingRequest(String text) {
        Map<String, Object> requestBody = Map.of(
                "model", "models/" + geminiProperties.embeddingModel(),
                "content", Map.of("parts", List.of(Map.of("text", text)))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(requestBody, headers);
    }

    /**
     * Extracts the "embedding.values" array from the raw Gemini API response body.
     */
    @SuppressWarnings("unchecked")
    private List<Double> extractEmbeddingValues(Map<String, Object> responseBody) {
        return Optional.ofNullable(responseBody)
                .map(body -> body.get("embedding"))
                .filter(Map.class::isInstance)
                .map(embeddingNode -> (Map<String, Object>) embeddingNode)
                .map(embeddingNode -> embeddingNode.get("values"))
                .filter(List.class::isInstance)
                .map(values -> (List<Double>) values)
                .orElseThrow(() -> new SearchExecutionException(
                        "Failed to extract 'values' array from Gemini response"));
    }
}
