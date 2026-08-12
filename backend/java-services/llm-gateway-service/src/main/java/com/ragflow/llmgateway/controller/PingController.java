package com.ragflow.llmgateway.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lightweight liveness probe — confirms the process is up, with no dependency checks (DB/Redis
 * health is covered separately by {@code /actuator/health}).
 */
@RestController
@Tag(name = "Ping", description = "Liveness probe")
public class PingController {

    @GetMapping("/ping")
    @Operation(summary = "Liveness check", description = "Returns 200 immediately if the process is alive.")
    public String ping() {
        return "pong";
    }
}
