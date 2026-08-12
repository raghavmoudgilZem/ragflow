package com.ragflow.llmgateway.mapper;

import com.ragflow.llmgateway.dto.response.CredentialFieldResponse;
import com.ragflow.llmgateway.dto.response.FactoryResponse;
import com.ragflow.llmgateway.entity.CredentialField;
import com.ragflow.llmgateway.entity.LlmFactory;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Manual entity-to-DTO mapping for {@link LlmFactory}.
 */
@Component
public class FactoryMapper {

    public FactoryResponse toResponse(LlmFactory factory) {
        return new FactoryResponse(
                factory.getName(),
                factory.getDisplayName(),
                factory.getLogoUrl(),
                factory.getTagList(),
                toCredentialFieldResponses(factory.getCredentialSchema()),
                factory.getRank(),
                factory.isLaunchSupported(),
                factory.isActive()
        );
    }

    private List<CredentialFieldResponse> toCredentialFieldResponses(List<CredentialField> credentialSchema) {
        if (credentialSchema == null) {
            return List.of();
        }
        return credentialSchema.stream()
                .map(field -> new CredentialFieldResponse(
                        field.key(),
                        field.label(),
                        Boolean.TRUE.equals(field.secret()),
                        Boolean.TRUE.equals(field.required())))
                .toList();
    }
}
