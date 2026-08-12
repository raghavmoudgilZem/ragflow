package com.rag.notification.controller;

import com.rag.notification.dto.request.CreateTemplateRequest;
import com.rag.notification.dto.request.CreateTemplateVersionRequest;
import com.rag.notification.dto.request.UpdateTemplateStatusRequest;
import com.rag.notification.dto.response.ApiResponse;
import com.rag.notification.dto.response.PagedResponse;
import com.rag.notification.dto.response.TemplatePreviewResponse;
import com.rag.notification.dto.response.TemplateResponse;
import com.rag.notification.service.TemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @PostMapping
    public ResponseEntity<ApiResponse<TemplateResponse>> create(@Valid @RequestBody CreateTemplateRequest request) {
        TemplateResponse data = templateService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TemplateResponse>>> list(@RequestParam(required = false) Boolean status,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size,
                                                                    @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                    @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<TemplateResponse> data = templateService.list(status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), data));
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<ApiResponse<TemplateResponse>> getById(@PathVariable Long templateId) {
        TemplateResponse data = templateService.getById(templateId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), data));
    }

    @GetMapping("/{templateId}/preview")
    public ResponseEntity<ApiResponse<TemplatePreviewResponse>> preview(
            @PathVariable Long templateId,
            @RequestParam Map<String, String> sampleData
    ) {
        TemplatePreviewResponse data = templateService.preview(templateId, sampleData);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), data));
    }

    @PatchMapping("/{templateId}/status")
    public ResponseEntity<ApiResponse<TemplateResponse>> updateStatus(
            @PathVariable Long templateId,
            @Valid @RequestBody UpdateTemplateStatusRequest request
    ) {
        TemplateResponse data = templateService.updateStatus(templateId, request.status());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), data));
    }

    @PostMapping("/{templateId}/version")
    public ResponseEntity<ApiResponse<TemplateResponse>> createNewVersion(
            @PathVariable Long templateId,
            @Valid @RequestBody CreateTemplateVersionRequest request
    ) {
        TemplateResponse data = templateService.createNewVersion(templateId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), data));
    }
}