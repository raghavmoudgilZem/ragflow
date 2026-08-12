package com.ragflow.llmgateway.controller;

import com.ragflow.llmgateway.constants.ApiEndpoints;
import com.ragflow.llmgateway.dto.ApiResponse;
import com.ragflow.llmgateway.dto.response.FactoryResponse;
import com.ragflow.llmgateway.service.FactoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping(ApiEndpoints.FACTORIES)
@Tag(name = "Factories", description = "Catalog of supported LLM providers")
public class FactoryController {

    private final FactoryService factoryService;

    @GetMapping
    @Operation(summary = "List LLM factories",
            description = "Returns the LLM provider catalog, highest rank first. Defaults to active "
                    + "factories only; pass active=false to include inactive ones.")
    public ResponseEntity<ApiResponse<List<FactoryResponse>>> listFactories(
            @Parameter(description = "Restrict to factories currently available for tenant configuration")
            @RequestParam(defaultValue = "true") boolean active,
            @Parameter(description = "Restrict to factories carrying this capability tag, e.g. LLM or TEXT EMBEDDING")
            @RequestParam(required = false) String tag) {
        return ResponseEntity.ok(ApiResponse.ok(factoryService.getFactories(active, tag)));
    }

    @GetMapping("/{name}")
    @Operation(summary = "Get an LLM factory by name", description = "Returns a single factory's details.")
    public ResponseEntity<ApiResponse<FactoryResponse>> getFactory(
            @Parameter(description = "Factory name", example = "OpenAI")
            @PathVariable @NotBlank String name) {
        return ResponseEntity.ok(ApiResponse.ok(factoryService.getFactoryByName(name)));
    }
}
