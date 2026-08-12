package com.ragflow.retrieval.controller;

import com.ragflow.retrieval.dto.response.DatasetResponse;
import com.ragflow.retrieval.service.DatasetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/datasets")
@RequiredArgsConstructor
public class DatasetController {

    private final DatasetService datasetService;

    @GetMapping("/recent")
    List<DatasetResponse> getRecentDatasets(@RequestParam String tenantId){
        return datasetService.getRecentDatasets(tenantId);
    }
}
