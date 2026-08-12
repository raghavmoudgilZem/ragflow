package com.ragflow.llmgateway.entity;

/**
 * One entry of an {@link LlmFactory}'s {@code credential_schema} JSON array — describes a single
 * credential input (e.g. API key, endpoint URL) a tenant must supply to configure that factory.
 */
public record CredentialField(
        String key,
        String label,
        Boolean secret,
        Boolean required
) {
}
