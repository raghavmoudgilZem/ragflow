package com.ragflow.dataset.implementation;

import com.ragflow.dataset.exception.DatasetValidationException;
import com.ragflow.dataset.records.Pipeline;
import com.ragflow.dataset.service.PipelineService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MockPipelineService implements PipelineService {

    private static final List<Pipeline> MOCK_PIPELINES = List.of(
            new Pipeline("pipeline-default-rag", "Default RAG Pipeline"),
            new Pipeline("pipeline-legal-docs", "Legal Document Pipeline"),
            new Pipeline("pipeline-qa-optimized", "QA-Optimized Pipeline")
    );

    @Override
    public Pipeline validateAndGet(String tenantId, String pipelineId) {
        return MOCK_PIPELINES.stream()
                .filter(p -> p.id().equals(pipelineId))
                .findFirst()
                .orElseThrow(() -> new DatasetValidationException("Pipeline '" + pipelineId + "' not found"));
    }

    @Override
    public List<Pipeline> listAvailable(String tenantId) {
        return MOCK_PIPELINES;
    }
}
