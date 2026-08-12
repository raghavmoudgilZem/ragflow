package com.ragflow.dataset.service;

import com.ragflow.dataset.records.EmbeddingModelList;

import java.util.List;

public interface EmbeddingModelService {
    EmbeddingModelList validateAndGet(String tenantId, String modelName);

    List<EmbeddingModelList> listAvailable(String tenantId);
}
