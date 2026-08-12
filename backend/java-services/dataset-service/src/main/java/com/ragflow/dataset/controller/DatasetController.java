package com.ragflow.dataset.controller;

import com.ragflow.dataset.dto.ApiResponseDto;
import com.ragflow.dataset.dto.CreateDatasetRequestDto;
import com.ragflow.dataset.implementation.DatasetServiceImpl;
import com.ragflow.dataset.records.UpdateDatasetRequest;
import com.ragflow.dataset.utility.CommonConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Equivalent of the `/datasets` POST route in dataset_api.py, scoped to the
 * "Create Dataset" modal described in the functional spec. Auth/tenant
 * resolution is handled by TenantContext (backed by Spring Security), the
 * equivalent of @login_required + add_tenant_id_to_kwargs.
 */
@RestController
@RequestMapping(CommonConstants.BASE_URL)
@RequiredArgsConstructor
public class DatasetController {

    private final DatasetServiceImpl datasetServiceImpl;


    @PostMapping()
    public ResponseEntity<ApiResponseDto> createDataset(@RequestParam String tenantId, @Valid @RequestBody CreateDatasetRequestDto request) {
        ApiResponseDto dataSet = datasetServiceImpl.createDataSet(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dataSet);

    }

    @GetMapping()
    public ResponseEntity<ApiResponseDto> getAllDatasetDetail(@RequestParam String tenantId){
        ApiResponseDto response = datasetServiceImpl.getAllDatasetDetail(tenantId);
        return ResponseEntity.status(HttpStatus.FOUND).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto> getDatasetDetail(@PathVariable UUID id, @RequestParam String tenantId){
        ApiResponseDto response = datasetServiceImpl.getDatasetDetail(id, tenantId);
        return ResponseEntity.status(HttpStatus.FOUND).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponseDto> updateDataset(
            @PathVariable UUID id, @RequestParam String tenantId, @Valid @RequestBody UpdateDatasetRequest request) {
        ApiResponseDto response = datasetServiceImpl.updateDataset(id,tenantId,request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto> deleteDataset(@PathVariable UUID id,  @RequestParam String tenantId) {
        ApiResponseDto response = datasetServiceImpl.deleteDataset(id, tenantId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }
}
