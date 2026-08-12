package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.response.DatasetResponse;
import com.ragflow.retrieval.entity.Dataset;
import com.ragflow.retrieval.repository.KnowledgebaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DatasetService {

    @Autowired
    private KnowledgebaseRepository repository;

    public List<DatasetResponse> getRecentDatasets(String tenantId) {

        if (tenantId == null || tenantId.isBlank()) {
            return repository.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }
        return repository.findRecentByTenant(tenantId);
    }

    private DatasetResponse mapToResponse(Dataset dataset) {
        return DatasetResponse.builder()
                .id(dataset.getId())
                .name(dataset.getName())
                .docNum(dataset.getDocNum())
                .chunkNum(dataset.getChunkNum())
                .tokenNum(dataset.getTokenNum())
                .build();
    }
}
