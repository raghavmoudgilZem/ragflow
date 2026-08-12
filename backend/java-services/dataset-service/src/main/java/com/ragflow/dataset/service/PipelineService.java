package com.ragflow.dataset.service;

import com.ragflow.dataset.records.Pipeline;

import java.util.List;

public interface PipelineService {

    Pipeline validateAndGet(String tenantId, String pipelineId);
    List<Pipeline> listAvailable(String tenantId);
}
