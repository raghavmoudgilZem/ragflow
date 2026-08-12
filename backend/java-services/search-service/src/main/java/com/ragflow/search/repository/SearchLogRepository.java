package com.ragflow.search.repository;

import com.ragflow.search.entity.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, String> {

    List<SearchLog> findByTenantIdAndUserIdOrderByCreatedAtDesc(
            String tenantId, String userId);
}