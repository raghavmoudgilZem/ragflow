package com.ragflow.llmgateway.repository;

import com.ragflow.llmgateway.entity.LlmFactory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Read access to the {@code llm_factory} catalog table. Writes are performed exclusively by the
 * {@code R__seed_catalog.sql} Flyway migration, not by the application.
 */
public interface LlmFactoryRepository extends JpaRepository<LlmFactory, String> {

    List<LlmFactory> findAllByOrderByRankDesc();

    List<LlmFactory> findByActiveTrueOrderByRankDesc();
}
