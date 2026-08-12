package com.ragflow.llmgateway.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * One credential input a tenant must supply to configure a factory (e.g. an API key field).
 */
public record CredentialFieldResponse(

        @Schema(description = "Credential field identifier used as the JSON key when a tenant submits credentials",
                example = "apiKey")
        String key,

        @Schema(description = "Human-readable label for this field", example = "API Key")
        String label,

        @Schema(description = "Whether this field's value should be masked/stored as a secret", example = "true")
        boolean secret,

        @Schema(description = "Whether this field is required to configure the factory", example = "true")
        boolean required
) {
}
