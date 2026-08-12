package com.ragflow.retrieval.repository;

import com.ragflow.retrieval.entity.SearchConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaSearchConfigurationRepository extends JpaRepository<SearchConfiguration, UUID> {
    Optional<SearchConfiguration> findFirstByIsDeletedFalseOrderByCreatedAtDesc();
}