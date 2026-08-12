package com.ragflow.llmgateway.service.impl;

import com.ragflow.llmgateway.dto.response.FactoryResponse;
import com.ragflow.llmgateway.entity.CredentialField;
import com.ragflow.llmgateway.entity.LlmFactory;
import com.ragflow.llmgateway.exception.ResourceNotFoundException;
import com.ragflow.llmgateway.mapper.FactoryMapper;
import com.ragflow.llmgateway.repository.LlmFactoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link FactoryServiceImpl}. Repository and mapper are mocked — this class
 * exercises only the service's own branching logic (active/tag filtering, not-found handling).
 */
@ExtendWith(MockitoExtension.class)
class FactoryServiceImplTest {

    @Mock
    private LlmFactoryRepository llmFactoryRepository;

    @Mock
    private FactoryMapper factoryMapper;

    @InjectMocks
    private FactoryServiceImpl factoryService;

    private LlmFactory openAi;
    private LlmFactory anthropic;
    private LlmFactory inactiveOllama;

    @BeforeEach
    void setUp() {
        openAi = factory("OpenAI", "LLM,TEXT EMBEDDING", 100, true);
        anthropic = factory("Anthropic", "LLM", 95, true);
        inactiveOllama = factory("Ollama", "LLM, TEXT EMBEDDING", 50, false);
    }

    @Nested
    class GetFactories {

        @Test
        void returnsActiveFactoriesFromActiveRepositoryQuery_whenActiveOnlyIsTrue() {
            // Arrange
            when(llmFactoryRepository.findByActiveTrueOrderByRankDesc()).thenReturn(List.of(openAi, anthropic));
            when(factoryMapper.toResponse(openAi)).thenReturn(response("OpenAI"));
            when(factoryMapper.toResponse(anthropic)).thenReturn(response("Anthropic"));

            // Act
            List<FactoryResponse> result = factoryService.getFactories(true, null);

            // Assert
            assertThat(result).extracting(FactoryResponse::name).containsExactly("OpenAI", "Anthropic");
            verify(llmFactoryRepository).findByActiveTrueOrderByRankDesc();
            verify(llmFactoryRepository, never()).findAllByOrderByRankDesc();
        }

        @Test
        void returnsAllFactoriesFromUnfilteredRepositoryQuery_whenActiveOnlyIsFalse() {
            // Arrange
            when(llmFactoryRepository.findAllByOrderByRankDesc()).thenReturn(List.of(openAi, anthropic, inactiveOllama));
            when(factoryMapper.toResponse(any(LlmFactory.class)))
                    .thenAnswer(invocation -> response(invocation.<LlmFactory>getArgument(0).getName()));

            // Act
            List<FactoryResponse> result = factoryService.getFactories(false, null);

            // Assert
            assertThat(result).extracting(FactoryResponse::name).containsExactly("OpenAI", "Anthropic", "Ollama");
            verify(llmFactoryRepository).findAllByOrderByRankDesc();
            verify(llmFactoryRepository, never()).findByActiveTrueOrderByRankDesc();
        }

        @Test
        void filtersOutFactoriesNotCarryingTheRequestedTag() {
            // Arrange
            when(llmFactoryRepository.findByActiveTrueOrderByRankDesc()).thenReturn(List.of(openAi, anthropic));
            when(factoryMapper.toResponse(openAi)).thenReturn(response("OpenAI"));

            // Act
            List<FactoryResponse> result = factoryService.getFactories(true, "TEXT EMBEDDING");

            // Assert — only OpenAI carries "TEXT EMBEDDING"; Anthropic (LLM-only) is dropped
            assertThat(result).extracting(FactoryResponse::name).containsExactly("OpenAI");
            verify(factoryMapper, never()).toResponse(anthropic);
        }

        @ParameterizedTest
        @ValueSource(strings = {"llm", "LLM", "Llm", "lLm"})
        void tagMatchIsCaseInsensitive(String requestedTag) {
            // Arrange
            when(llmFactoryRepository.findByActiveTrueOrderByRankDesc()).thenReturn(List.of(anthropic));
            when(factoryMapper.toResponse(anthropic)).thenReturn(response("Anthropic"));

            // Act
            List<FactoryResponse> result = factoryService.getFactories(true, requestedTag);

            // Assert
            assertThat(result).extracting(FactoryResponse::name).containsExactly("Anthropic");
        }

        @ParameterizedTest
        @ValueSource(strings = {"", "   "})
        void blankTagIsTreatedAsNoFilter(String blankTag) {
            // Arrange
            when(llmFactoryRepository.findByActiveTrueOrderByRankDesc()).thenReturn(List.of(openAi, anthropic));
            when(factoryMapper.toResponse(any(LlmFactory.class)))
                    .thenAnswer(invocation -> response(invocation.<LlmFactory>getArgument(0).getName()));

            // Act
            List<FactoryResponse> result = factoryService.getFactories(true, blankTag);

            // Assert
            assertThat(result).hasSize(2);
        }

        @Test
        void nullTagIsTreatedAsNoFilter() {
            // Arrange
            when(llmFactoryRepository.findByActiveTrueOrderByRankDesc()).thenReturn(List.of(openAi, anthropic));
            when(factoryMapper.toResponse(any(LlmFactory.class)))
                    .thenAnswer(invocation -> response(invocation.<LlmFactory>getArgument(0).getName()));

            // Act
            List<FactoryResponse> result = factoryService.getFactories(true, null);

            // Assert
            assertThat(result).hasSize(2);
        }

        @Test
        void returnsEmptyList_whenNoFactoryCarriesTheRequestedTag() {
            // Arrange
            when(llmFactoryRepository.findByActiveTrueOrderByRankDesc()).thenReturn(List.of(openAi, anthropic));

            // Act
            List<FactoryResponse> result = factoryService.getFactories(true, "IMAGE");

            // Assert
            assertThat(result).isEmpty();
            verify(factoryMapper, never()).toResponse(any());
        }

        @Test
        void returnsEmptyList_whenRepositoryHasNoRows() {
            // Arrange
            when(llmFactoryRepository.findByActiveTrueOrderByRankDesc()).thenReturn(List.of());

            // Act
            List<FactoryResponse> result = factoryService.getFactories(true, null);

            // Assert
            assertThat(result).isEmpty();
        }
    }

    @Nested
    class GetFactoryByName {

        @Test
        void returnsMappedResponse_whenFactoryExists() {
            // Arrange
            when(llmFactoryRepository.findById("OpenAI")).thenReturn(Optional.of(openAi));
            FactoryResponse expected = response("OpenAI");
            when(factoryMapper.toResponse(openAi)).thenReturn(expected);

            // Act
            FactoryResponse result = factoryService.getFactoryByName("OpenAI");

            // Assert
            assertThat(result).isSameAs(expected);
        }

        @Test
        void throwsResourceNotFoundException_whenFactoryDoesNotExist() {
            // Arrange
            when(llmFactoryRepository.findById("DoesNotExist")).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> factoryService.getFactoryByName("DoesNotExist"))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("DoesNotExist");
            verify(factoryMapper, never()).toResponse(any());
        }

        @Test
        void looksUpByExactNameOnly_noCaseNormalization() {
            // Arrange — no stub registered for lowercase "openai"; only the exact-case name would match
            when(llmFactoryRepository.findById("openai")).thenReturn(Optional.empty());

            // Act & Assert — differently-cased lookup falls through to the not-found path
            assertThatThrownBy(() -> factoryService.getFactoryByName("openai"))
                    .isInstanceOf(ResourceNotFoundException.class);
            verify(llmFactoryRepository, times(1)).findById("openai");
            verify(llmFactoryRepository, never()).findById("OpenAI");
        }
    }

    private LlmFactory factory(String name, String tags, int rank, boolean active) {
        LlmFactory factory = new LlmFactory();
        factory.setName(name);
        factory.setDisplayName(name);
        factory.setTags(tags);
        factory.setCredentialSchema(List.of(new CredentialField("apiKey", "API Key", true, true)));
        factory.setRank(rank);
        factory.setLaunchSupported(true);
        factory.setActive(active);
        return factory;
    }

    private FactoryResponse response(String name) {
        return new FactoryResponse(name, name, null, List.of(), List.of(), 0, true, true);
    }
}
