package com.ragflow.retrieval.repository;

import com.ragflow.retrieval.entity.SearchFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SearchFeedbackRepository extends JpaRepository<SearchFeedback, UUID> {
}
