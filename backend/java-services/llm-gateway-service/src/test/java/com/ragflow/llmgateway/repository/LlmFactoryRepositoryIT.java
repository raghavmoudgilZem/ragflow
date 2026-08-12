package com.ragflow.llmgateway.repository;

import com.ragflow.llmgateway.entity.CredentialField;
import com.ragflow.llmgateway.entity.LlmFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for {@link LlmFactoryRepository} against a real MySQL 8 instance (Testcontainers)
 * with the actual {@code db/migration} scripts applied — not H2, per this repo's testing
 * conventions, since a dialect mismatch (JSON column type, the reserved-word {@code `rank`}
 * column) could easily pass against H2 and fail against real MySQL.
 */
@Testcontainers
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class LlmFactoryRepositoryIT {

    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.39");

    @Autowired
    private LlmFactoryRepository repository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findAllByOrderByRankDesc_returnsAllSeededFactoriesHighestRankFirst() {
        // Act
        List<LlmFactory> factories = repository.findAllByOrderByRankDesc();

        // Assert — seeded by R__seed_catalog.sql; ranks are OpenAI 100, Anthropic 95, Azure-OpenAI 90, Ollama 50, Bedrock 40
        assertThat(factories).extracting(LlmFactory::getName)
                .containsExactly("OpenAI", "Anthropic", "Azure-OpenAI", "Ollama", "Bedrock");
    }

    @Test
    void findByActiveTrueOrderByRankDesc_excludesInactiveFactories() {
        // Arrange — all seeded factories are active; persist one inactive factory with the highest
        // rank of all, so if it leaked into the "active" query it would surface at the very front
        LlmFactory inactive = new LlmFactory();
        inactive.setName("TestInactiveFactory");
        inactive.setTags("LLM");
        inactive.setCredentialSchema(List.of());
        inactive.setRank(999);
        inactive.setLaunchSupported(false);
        inactive.setActive(false);
        entityManager.persistAndFlush(inactive);

        // Act
        List<LlmFactory> factories = repository.findByActiveTrueOrderByRankDesc();

        // Assert
        assertThat(factories).extracting(LlmFactory::getName).doesNotContain("TestInactiveFactory");
        assertThat(factories).extracting(LlmFactory::getName)
                .containsExactly("OpenAI", "Anthropic", "Azure-OpenAI", "Ollama", "Bedrock");
    }

    @Test
    void findById_returnsFactory_withCredentialSchemaCorrectlyDeserializedFromJson() {
        // Act
        Optional<LlmFactory> result = repository.findById("OpenAI");

        // Assert
        assertThat(result).isPresent();
        LlmFactory openAi = result.get();
        assertThat(openAi.getDisplayName()).isEqualTo("OpenAI");
        assertThat(openAi.getTagList()).containsExactly("LLM", "TEXT EMBEDDING");
        assertThat(openAi.getCredentialSchema())
                .extracting(CredentialField::key)
                .containsExactly("apiKey", "apiBase");
        assertThat(openAi.getCredentialSchema().get(0).secret()).isTrue();
        assertThat(openAi.getCredentialSchema().get(1).secret()).isFalse();
    }

    @Test
    void findById_returnsEmpty_whenFactoryDoesNotExist() {
        // Act
        Optional<LlmFactory> result = repository.findById("DoesNotExist");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void savedFactory_roundTripsJsonCredentialSchemaAndTheReservedWordRankColumn() {
        // Arrange
        LlmFactory factory = new LlmFactory();
        factory.setName("TestFactoryRoundTrip");
        factory.setDisplayName("Test Factory");
        factory.setTags("LLM,TEXT EMBEDDING");
        factory.setCredentialSchema(List.of(
                new CredentialField("apiKey", "API Key", true, true),
                new CredentialField("region", "Region", false, true)
        ));
        factory.setRank(77);
        factory.setLaunchSupported(true);
        factory.setActive(true);

        // Act — flush to MySQL and clear the persistence context so the re-fetch hits the DB, not the L1 cache
        entityManager.persistAndFlush(factory);
        entityManager.clear();
        LlmFactory reloaded = repository.findById("TestFactoryRoundTrip").orElseThrow();

        // Assert
        assertThat(reloaded.getRank()).isEqualTo(77);
        assertThat(reloaded.getCredentialSchema()).hasSize(2);
        assertThat(reloaded.getCredentialSchema().get(1).key()).isEqualTo("region");
        assertThat(reloaded.getCredentialSchema().get(1).required()).isTrue();
    }
}
