package com.ragflow.retrieval.repository;

import com.ragflow.retrieval.entity.SearchApp;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SearchRepository extends JpaRepository<SearchApp, String> {

    @Query("""
            SELECT s FROM SearchApp s
            WHERE s.tenantId = :tenantId
              AND s.status = :status
              AND (:keywords = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keywords, '%')))
            ORDER BY s.createTime DESC
            """)
    Page<SearchApp> findAllByTenantAndKeywords(@Param("tenantId") String tenantId,
                                               @Param("status") String status,
                                               @Param("keywords") String keywords,
                                               Pageable pageable);

    Optional<SearchApp> findByIdAndTenantIdAndStatus(String id, String tenantId, String status);

    boolean existsByTenantIdAndNameAndStatus(String tenantId, String name, String status);
}
