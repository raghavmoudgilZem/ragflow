package com.ragflow.llmgateway.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * A supported LLM provider, as exposed to API consumers.
 */
public record FactoryResponse(

        @Schema(description = "Unique factory identifier", example = "OpenAI")
        String name,

        @Schema(description = "Display name shown in the UI", example = "OpenAI")
        String displayName,

        @Schema(description = "URL of the factory's logo")
        String logoUrl,

        @Schema(description = "Capability tags, e.g. LLM, TEXT EMBEDDING")
        List<String> tags,

        @Schema(description = "Credential fields a tenant must fill in to configure this factory")
        List<CredentialFieldResponse> credentialSchema,

        @Schema(description = "Display rank, higher shows first", example = "100")
        int rank,

        @Schema(description = "Whether this factory can be launched/deployed as a self-hosted instance")
        boolean launchSupported,

        @Schema(description = "Whether this factory is currently available for tenant configuration")
        boolean active
) {
}
