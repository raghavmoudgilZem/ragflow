package com.ragflow.retrieval.service;

import com.ragflow.retrieval.dto.request.SearchConfigurationRequest;
import com.ragflow.retrieval.dto.response.SearchConfigurationResponse;

public interface SearchConfigurationService {
    SearchConfigurationResponse getConfiguration();
    SearchConfigurationResponse updateConfiguration(SearchConfigurationRequest request);
}
