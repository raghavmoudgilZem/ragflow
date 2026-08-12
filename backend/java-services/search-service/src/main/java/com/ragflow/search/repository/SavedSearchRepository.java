package com.ragflow.search.repository;

import com.ragflow.search.entity.SavedSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedSearchRepository extends JpaRepository<SavedSearch, String> {

    @Query("SELECT s FROM SavedSearch s WHERE s.tenantId = :tenantId " +
            "AND s.userId = :userId AND s.deletedAt IS NULL " +
            "ORDER BY s.createdAt DESC")
    List<SavedSearch> findActiveByTenantIdAndUserId(
            @Param("tenantId") String tenantId,
            @Param("userId") String userId);

    @Query("SELECT s FROM SavedSearch s WHERE s.id = :id " +
            "AND s.tenantId = :tenantId AND s.deletedAt IS NULL")
    Optional<SavedSearch> findActiveByIdAndTenantId(
            @Param("id") String id,
            @Param("tenantId") String tenantId);
}