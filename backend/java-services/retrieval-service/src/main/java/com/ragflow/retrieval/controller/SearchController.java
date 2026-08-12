package com.ragflow.retrieval.controller;

import com.ragflow.retrieval.constants.ApiConstants;
import com.ragflow.retrieval.dto.request.ElasticSearchRequest;
import com.ragflow.retrieval.dto.request.SearchAppCreateRequest;
import com.ragflow.retrieval.dto.response.ErrorResponse;
import com.ragflow.retrieval.dto.response.SearchPageResponse;
import com.ragflow.retrieval.dto.response.SearchDetailResponse;
import com.ragflow.retrieval.dto.response.SearchSimulationResponse;
import com.ragflow.retrieval.dto.response.elasticSearch.ElasticSearchResponse;
import com.ragflow.retrieval.service.ElasticSearchService;
import com.ragflow.retrieval.service.SearchService;
import com.ragflow.retrieval.service.SearchSimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.API_V1 + ApiConstants.SEARCHES)
@RequiredArgsConstructor
@Slf4j
public class SearchController {

    private final SearchService searchService;
    private final SearchSimulationService searchSimulationService;
    private final ElasticSearchService elasticSearchService;

//  List Search Apps (paginated, filterable).
    @GetMapping
    public SearchPageResponse<SearchDetailResponse> list(
            @RequestParam(name = "keywords", required = false, defaultValue = "") String keywords,
            @RequestParam(name = "page", required = false, defaultValue = "1") int page,
            @RequestParam(name = "pageSize", required = false, defaultValue = "50") int pageSize) {
        return searchService.getSearchList(keywords, page, pageSize);
    }

//  Create Search App.
    @PostMapping
    public ResponseEntity<String> create(
            @Valid @RequestBody SearchAppCreateRequest request) {
        String searchId = searchService.create(request);
        return ResponseEntity.status(HttpStatus.OK).body(searchId);
    }

//  Get Search App by ID.
    @GetMapping("/{id}")
    public ResponseEntity<SearchDetailResponse> getById(@PathVariable("id") String id) {
        return ResponseEntity.status(HttpStatus.OK).body(searchService.getById(id));
    }

//  Delete Search App.
    @DeleteMapping("/{searchId}")
    public ResponseEntity<Void> delete(@PathVariable("searchId") String searchId) {
        searchService.delete(searchId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @Operation(
            summary = "Simulate search query",
            description = "Executes the retrieval pipeline and returns search results with debug metadata."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search simulation completed successfully"),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal Server Error",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    @GetMapping("/simulate")
    @Validated
    //@PreAuthorize("hasAnyRole('ADMIN', 'BUILDER')")
    public ResponseEntity<SearchSimulationResponse> simulate(
            @Parameter(description = "Search query", required = true)
            @RequestParam("q") @NotBlank String query,

            @Parameter(description = "Maximum number of results", example = "10")
            @RequestParam(value = "topK", defaultValue = "10") @Positive int topK) {

        log.info("Received search simulation request. query='{}', topK={}", query, topK);

        SearchSimulationResponse response = searchSimulationService.simulate(query, topK);

        log.info("Search simulation completed successfully. Returned {} result(s).",
                response.results().size());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/hybrid")
    public ResponseEntity<ElasticSearchResponse> hybridSearch(@Valid @RequestBody ElasticSearchRequest request) {
        log.info("START: hybridSearch endpoint invoked for question '{}'", request.question());

        ElasticSearchResponse response = elasticSearchService.performRagFlowHybridSearch(request);

        log.info("END: hybridSearch endpoint completed successfully");
        return ResponseEntity.ok(response);
    }
}

