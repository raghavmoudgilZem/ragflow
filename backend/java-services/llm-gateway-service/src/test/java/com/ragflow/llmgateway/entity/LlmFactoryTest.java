package com.ragflow.llmgateway.entity;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link LlmFactory}'s hand-written behavior — {@code getTagList()} and the
 * ID-only {@code equals()}/{@code hashCode()} contract (Lombok-generated, but the contract itself
 * is worth pinning down since it drives correctness in Sets/Maps and JPA identity).
 */
class LlmFactoryTest {

    @Nested
    class GetTagList {

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   "})
        void returnsEmptyList_whenTagsIsNullOrBlank(String tags) {
            // Arrange
            LlmFactory factory = new LlmFactory();
            factory.setTags(tags);

            // Act
            var result = factory.getTagList();

            // Assert
            assertThat(result).isEmpty();
        }

        @Test
        void returnsSingleTag_whenTagsHasNoCommas() {
            // Arrange
            LlmFactory factory = new LlmFactory();
            factory.setTags("LLM");

            // Act & Assert
            assertThat(factory.getTagList()).containsExactly("LLM");
        }

        @Test
        void splitsAndTrimsMultipleTags() {
            // Arrange
            LlmFactory factory = new LlmFactory();
            factory.setTags("LLM,  TEXT EMBEDDING ,IMAGE");

            // Act & Assert
            assertThat(factory.getTagList()).containsExactly("LLM", "TEXT EMBEDDING", "IMAGE");
        }

        @Test
        void dropsEmptyEntriesFromDoubleOrTrailingCommas() {
            // Arrange
            LlmFactory factory = new LlmFactory();
            factory.setTags("LLM,,TEXT EMBEDDING,");

            // Act & Assert
            assertThat(factory.getTagList()).containsExactly("LLM", "TEXT EMBEDDING");
        }

        @Test
        void preservesOriginalCasing() {
            // Arrange
            LlmFactory factory = new LlmFactory();
            factory.setTags("llm,Text Embedding");

            // Act & Assert — case normalization is the caller's job (see FactoryServiceImpl), not the parser's
            assertThat(factory.getTagList()).containsExactly("llm", "Text Embedding");
        }
    }

    @Nested
    class EqualsAndHashCode {

        @Test
        void twoInstancesWithSameName_areEqual_regardlessOfOtherFields() {
            // Arrange
            LlmFactory a = new LlmFactory();
            a.setName("OpenAI");
            a.setRank(100);

            LlmFactory b = new LlmFactory();
            b.setName("OpenAI");
            b.setRank(1);

            // Act & Assert
            assertThat(a).isEqualTo(b);
            assertThat(a.hashCode()).isEqualTo(b.hashCode());
        }

        @Test
        void instancesWithDifferentNames_areNotEqual() {
            // Arrange
            LlmFactory a = new LlmFactory();
            a.setName("OpenAI");
            LlmFactory b = new LlmFactory();
            b.setName("Anthropic");

            // Act & Assert
            assertThat(a).isNotEqualTo(b);
        }

        @Test
        void isNotEqualToNullOrDifferentType() {
            // Arrange
            LlmFactory a = new LlmFactory();
            a.setName("OpenAI");

            // Act & Assert
            assertThat(a).isNotEqualTo(null);
            assertThat(a).isNotEqualTo("OpenAI");
        }
    }
}
