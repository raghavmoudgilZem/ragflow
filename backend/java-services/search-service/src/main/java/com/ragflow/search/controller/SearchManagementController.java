package com.ragflow.search.controller;

import com.ragflow.search.constant.AppConstants;
import com.ragflow.search.dto.request.CreateSearchRequest;
import com.ragflow.search.dto.request.SearchListRequest;
import com.ragflow.search.dto.response.ApiResponse;
import com.ragflow.search.dto.response.SearchDetailResponse;
import com.ragflow.search.dto.response.SearchListResponse;
import com.ragflow.search.service.SearchManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping(AppConstants.PATH_SEARCHES)
@RequiredArgsConstructor
@Tag(name = "Search Management", description = "CRUD for search configurations — ported from Python monolith")
public class SearchManagementController {

    private final SearchManagementService searchManagementService;

    /**
     * POST /api/v1/searches
     * Replaces Python: SearchService.save(**kwargs)
     */
    @PostMapping
    @Operation(summary = "Create search configuration",
            description = "Replaces Python save(**kwargs). Auto-sets timestamps + status=1.")
    public ResponseEntity<ApiResponse<SearchDetailResponse>> create(
            @Valid @RequestBody CreateSearchRequest request,
            @Parameter(description = "Injected by YARP Gateway from JWT")
            @RequestHeader(AppConstants.HEADER_TENANT_ID) String tenantId,
            @Parameter(description = "Injected by YARP Gateway from JWT")
            @RequestHeader(AppConstants.HEADER_USER_ID) String userId) {

        log.debug("POST /api/v1/searches tenant={} user={}", tenantId, userId);
        SearchDetailResponse response = searchManagementService.save(request, tenantId, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response));
    }

    /**
     * GET /api/v1/searches/{id}
     * Replaces Python: SearchService.get_detail(search_id)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get search detail",
            description = "Replaces Python get_detail(). Returns all 10 fields + user JOIN data.")
    public ResponseEntity<ApiResponse<SearchDetailResponse>> getDetail(
            @PathVariable String id,
            @RequestHeader(AppConstants.HEADER_TENANT_ID) String tenantId,
            @RequestHeader(AppConstants.HEADER_USER_ID) String userId) {

        log.debug("GET /api/v1/searches/{} tenant={}", id, tenantId);
        SearchDetailResponse response = searchManagementService.getDetail(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * GET /api/v1/searches
     * Replaces Python: SearchService.get_by_tenant_ids(...)
     */
    @GetMapping
    @Operation(summary = "List searches with pagination",
            description = "Replaces Python get_by_tenant_ids(). " +
                    "1-based pagination, case-insensitive keyword filter, dynamic sort.")
    public ResponseEntity<ApiResponse<SearchListResponse>> list(
            SearchListRequest request,
            @RequestHeader(AppConstants.HEADER_TENANT_ID) String tenantId,
            @RequestHeader(AppConstants.HEADER_USER_ID) String userId) {

        log.debug("GET /api/v1/searches page={} keywords={} tenant={}",
                request.pageNumber(), request.keywords(), tenantId);

        SearchListRequest effectiveRequest = buildEffectiveRequest(request, tenantId);
        SearchListResponse response = searchManagementService.getByTenantIds(effectiveRequest, userId);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Ensures the requesting tenant ID is present in the record's tenant search list
     * without mutating the original record instance.
     */
    private SearchListRequest buildEffectiveRequest(SearchListRequest request, String tenantId) {
        List<String> tenantIds = new ArrayList<>(ObjectUtils.defaultIfNull(request.tenantIds(), List.of()));
        if (!tenantIds.contains(tenantId)) {
            tenantIds.add(tenantId);
        }

        return new SearchListRequest(
                tenantIds,
                request.pageNumber(),
                request.itemsPerPage(),
                request.orderBy(),
                request.desc(),
                request.keywords()
        );
    }

    /**
     * DELETE /api/v1/searches/{id}
     * Replaces Python: accessible4deletion() + soft delete (status=0)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete search",
            description = "Checks ownership via X-User-Id. Sets status=0 (INVALID). 403 if not owner.")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            @RequestHeader(AppConstants.HEADER_TENANT_ID) String tenantId,
            @RequestHeader(AppConstants.HEADER_USER_ID) String userId) {

        log.debug("DELETE /api/v1/searches/{} user={}", id, userId);
        searchManagementService.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /**
     * DELETE /api/v1/searches/tenant/{tenantId}
     * Replaces Python: SearchService.delete_by_tenant_id(tenant_id)
     * HARD delete — admin only
     */
    @DeleteMapping("/tenant/{tenantId}")
    @Operation(summary = "Hard delete all searches for tenant (admin)",
            description = "Replaces Python delete_by_tenant_id(). Returns deleted row count.")
    public ResponseEntity<ApiResponse<Integer>> deleteByTenant(
            @PathVariable String tenantId,
            @RequestHeader(AppConstants.HEADER_TENANT_ID) String requestingTenantId) {

        log.debug("DELETE /api/v1/searches/tenant/{}", tenantId);
        int count = searchManagementService.deleteByTenantId(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(count));
    }
}