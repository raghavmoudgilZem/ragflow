package com.ragflow.dataset.implementation;

import com.ragflow.dataset.exception.DatasetValidationException;
import com.ragflow.dataset.records.EmbeddingModelList;
import com.ragflow.dataset.service.EmbeddingModelService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MockEmbeddingModelService implements EmbeddingModelService {
    private static final List<EmbeddingModelList> MOCK_MODELS = List.of(
            new EmbeddingModelList("nomic-embed-text", "nomic-embed-text", "ollama"),
            new EmbeddingModelList("bge-large-zh-v1.5", "bge-large-zh-v1.5", "BAAI"),
            new EmbeddingModelList("text-embedding-3-small", "text-embedding-3-small", "openai"),
            new EmbeddingModelList("text-embedding-3-large", "text-embedding-3-large", "openai")
    );

    @Override
    public EmbeddingModelList validateAndGet(String tenantId, String modelName) {
        return MOCK_MODELS.stream()
                .filter(m -> m.id().equalsIgnoreCase(modelName) || m.name().equalsIgnoreCase(modelName))
                .findFirst()
                .orElseThrow(() -> new DatasetValidationException(
                        "embeddingModel " + modelName + "' is not a recognized embedding model"));
    }

    @Override
    public List<EmbeddingModelList> listAvailable(String tenantId) {
        return MOCK_MODELS;
    }
}
