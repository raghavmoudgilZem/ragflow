package com.ragflow.llmgateway.mapper;

import com.ragflow.llmgateway.dto.response.CredentialFieldResponse;
import com.ragflow.llmgateway.dto.response.FactoryResponse;
import com.ragflow.llmgateway.entity.CredentialField;
import com.ragflow.llmgateway.entity.LlmFactory;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link FactoryMapper#toResponse(LlmFactory)}.
 */
class FactoryMapperTest {

    private final FactoryMapper mapper = new FactoryMapper();

    @Test
    void mapsAllScalarFieldsDirectly() {
        // Arrange
        LlmFactory factory = new LlmFactory();
        factory.setName("OpenAI");
        factory.setDisplayName("OpenAI");
        factory.setLogoUrl("https://cdn.internal/openai.svg");
        factory.setTags("LLM");
        factory.setCredentialSchema(List.of());
        factory.setRank(100);
        factory.setLaunchSupported(true);
        factory.setActive(true);

        // Act
        FactoryResponse response = mapper.toResponse(factory);

        // Assert
        assertThat(response.name()).isEqualTo("OpenAI");
        assertThat(response.displayName()).isEqualTo("OpenAI");
        assertThat(response.logoUrl()).isEqualTo("https://cdn.internal/openai.svg");
        assertThat(response.rank()).isEqualTo(100);
        assertThat(response.launchSupported()).isTrue();
        assertThat(response.active()).isTrue();
    }

    @Test
    void mapsTagsThroughEntityTagList() {
        // Arrange
        LlmFactory factory = new LlmFactory();
        factory.setTags("LLM, TEXT EMBEDDING");
        factory.setCredentialSchema(List.of());

        // Act
        FactoryResponse response = mapper.toResponse(factory);

        // Assert — delegates to LlmFactory.getTagList(), including its trimming behavior
        assertThat(response.tags()).containsExactly("LLM", "TEXT EMBEDDING");
    }

    @Test
    void mapsEachCredentialFieldPreservingOrder() {
        // Arrange
        LlmFactory factory = new LlmFactory();
        factory.setTags("LLM");
        factory.setCredentialSchema(List.of(
                new CredentialField("apiKey", "API Key", true, true),
                new CredentialField("apiBase", "API Base URL", false, false)
        ));

        // Act
        FactoryResponse response = mapper.toResponse(factory);

        // Assert
        assertThat(response.credentialSchema()).containsExactly(
                new CredentialFieldResponse("apiKey", "API Key", true, true),
                new CredentialFieldResponse("apiBase", "API Base URL", false, false)
        );
    }

    @Test
    void treatsNullSecretAndRequiredFlagsAsFalse() {
        // Arrange
        LlmFactory factory = new LlmFactory();
        factory.setTags("LLM");
        factory.setCredentialSchema(List.of(new CredentialField("apiKey", "API Key", null, null)));

        // Act
        FactoryResponse response = mapper.toResponse(factory);

        // Assert
        CredentialFieldResponse field = response.credentialSchema().get(0);
        assertThat(field.secret()).isFalse();
        assertThat(field.required()).isFalse();
    }

    @Test
    void returnsEmptyCredentialList_whenCredentialSchemaIsNull() {
        // Arrange
        LlmFactory factory = new LlmFactory();
        factory.setTags("LLM");
        factory.setCredentialSchema(null);

        // Act
        FactoryResponse response = mapper.toResponse(factory);

        // Assert
        assertThat(response.credentialSchema()).isEmpty();
    }

    @Test
    void returnsEmptyCredentialList_whenCredentialSchemaIsEmpty() {
        // Arrange
        LlmFactory factory = new LlmFactory();
        factory.setTags("LLM");
        factory.setCredentialSchema(List.of());

        // Act
        FactoryResponse response = mapper.toResponse(factory);

        // Assert
        assertThat(response.credentialSchema()).isEmpty();
    }
}
