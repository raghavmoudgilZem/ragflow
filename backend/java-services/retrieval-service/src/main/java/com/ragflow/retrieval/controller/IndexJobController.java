package com.ragflow.retrieval.controller;

import com.ragflow.retrieval.constants.ApiConstants;
import com.ragflow.retrieval.dto.request.SubmitIndexJobRequest;
import com.ragflow.retrieval.dto.response.IndexJobResponse;
import com.ragflow.retrieval.entity.IndexJob;
import com.ragflow.retrieval.service.IndexJobService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.API_V1)
@Slf4j
@Validated
public class IndexJobController {

    private final IndexJobService indexJobService;

    public IndexJobController(IndexJobService indexJobService) {
        this.indexJobService = indexJobService;
    }

    @PostMapping("/kb/{kbId}/index-jobs")
    public ResponseEntity<IndexJobResponse> submitIndexJob(
            @PathVariable @NotBlank String kbId,
            @Valid @RequestBody SubmitIndexJobRequest request) {

        IndexJob job = indexJobService.submitIndexJob(kbId, request);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(IndexJobResponse.from(job));
    }
}
