package com.ragflow.search.controller;

import com.ragflow.search.dto.response.HealthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "System", description = "Health and liveness endpoints")
public class HealthController {

    /**
     * GET /health
     * Liveness probe — no auth required.
     * Called by YARP Gateway, Kubernetes, and monitoring tools.
     */
    @GetMapping("/health")
    @Operation(summary = "Service health check", description = "Returns UP status. No auth required.")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(HealthResponse.up());
    }

    /**
     * GET /ping
     * Simple ping endpoint for quick connectivity check.
     */
    @GetMapping("/ping")
    @Operation(summary = "Ping", description = "Simple liveness check")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("search-service is UP and RUNNING on port 9407");
    }
}