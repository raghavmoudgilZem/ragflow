package com.ragflow.llmgateway.service;

import com.ragflow.llmgateway.dto.response.FactoryResponse;

import java.util.List;

/**
 * Read access to the LLM factory catalog.
 */
public interface FactoryService {

    /**
     * Lists factories, highest rank first.
     *
     * @param activeOnly when {@code true}, only factories currently available for tenant
     *                    configuration are returned
     * @param tag         when present, only factories carrying this capability tag (case-insensitive,
     *                    exact match against one of the factory's tags) are returned
     * @return matching factories
     */
    List<FactoryResponse> getFactories(boolean activeOnly, String tag);

    /**
     * Fetches a single factory by its unique name.
     *
     * @param name the factory name, e.g. {@code "OpenAI"}
     * @return the matching factory
     * @throws com.ragflow.llmgateway.exception.ResourceNotFoundException if no factory has this name
     */
    FactoryResponse getFactoryByName(String name);
}
