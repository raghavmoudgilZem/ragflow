package com.ragflow.retrieval.controller;

import com.ragflow.retrieval.constants.ApiConstants;
import com.ragflow.retrieval.dto.request.SearchConfigurationRequest;
import com.ragflow.retrieval.dto.response.ErrorResponse;
import com.ragflow.retrieval.dto.response.MessageResponse;
import com.ragflow.retrieval.dto.response.SearchConfigurationResponse;
import com.ragflow.retrieval.service.SearchConfigurationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping(ApiConstants.API_V1 + ApiConstants.CONFIG_WEIGHTS)
@RequiredArgsConstructor
@Tag(name = "Search Configuration", description = "Manage search scoring weights configuration")
public class SearchConfigurationController {

    private final SearchConfigurationService service;

    @Operation(
            summary = "Get search configuration",
            description = "Fetch current similarity, keyword, and semantic weights"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    )),
            @ApiResponse(responseCode = "200", description = "Configuration fetched successfully")
    })
    @GetMapping
    public ResponseEntity<SearchConfigurationResponse> getConfiguration() {
        log.info("GET /config-weights - Fetching search configuration");
        SearchConfigurationResponse response = service.getConfiguration();
        log.debug("Fetched search configuration: {}", response);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update search configuration",
            description = "Update similarity, keyword, and semantic weights (values must be between 0 and 1)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Configuration updated successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class)
            )),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorResponse.class)
                    ))
    })
    @PutMapping
    public ResponseEntity<MessageResponse> updateConfiguration(@Valid @RequestBody SearchConfigurationRequest request) {
        log.info("PUT /config-weights - Updating configuration: {}", request);
        service.updateConfiguration(request);
        log.info("Search configuration updated successfully");
        return ResponseEntity.ok(new MessageResponse(HttpStatus.OK.value(), "Search configuration updated successfully."));
    }

}