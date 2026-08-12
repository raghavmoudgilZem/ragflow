package com.ragflow.dataset.service;

import com.ragflow.dataset.dto.ApiResponseDto;
import com.ragflow.dataset.dto.CreateDatasetRequestDto;
import com.ragflow.dataset.records.UpdateDatasetRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public interface DatasetService {


    /**
     * Validates and creates a new dataset for the given tenant.
     *
     * @param tenantId current tenant/user id (resolved from auth context)
     * @param request  validated Create Dataset modal payload
     * @return the created dataset, mapped to the API response shape
     */
    ApiResponseDto createDataSet(String tenantId, CreateDatasetRequestDto request);
    ApiResponseDto getDatasetDetail(UUID id, String tenantId);
    ApiResponseDto getAllDatasetDetail(String tenantId);
    ApiResponseDto updateDataset(UUID id, String tenantId, UpdateDatasetRequest request);
    ApiResponseDto deleteDataset(UUID id, String tenantId);
}
