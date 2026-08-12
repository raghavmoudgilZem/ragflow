package com.ragflow.search.repository;

import com.ragflow.search.entity.Search;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SearchRepository extends JpaRepository<Search, String> {

    /**
     * Python: accessible4deletion(search_id, user_id)
     * SELECT WHERE id=? AND created_by=? AND status=1
     */
    @Query("SELECT s FROM Search s WHERE s.id = :id AND s.createdBy = :createdBy AND s.status = 1")
    Optional<Search> findByIdAndCreatedByAndStatusValid(
            @Param("id") String id,
            @Param("createdBy") String createdBy);

    /**
     * Python: get_detail(search_id)
     * SELECT WHERE id=? AND status=1
     */
    @Query("SELECT s FROM Search s WHERE s.id = :id AND s.status = 1")
    Optional<Search> findByIdAndStatusValid(@Param("id") String id);

    /**
     * Python: get_by_tenant_ids(joined_tenant_ids, user_id, ...)
     * WHERE (tenant_id IN(?) OR tenant_id = userId) AND status=1
     * AND LOWER(name) LIKE LOWER(?)
     */
    @Query("SELECT s FROM Search s WHERE " +
            "(s.tenantId IN :tenantIds OR s.tenantId = :userId) " +
            "AND s.status = 1 " +
            "AND (:keywords IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keywords, '%')))")
    Page<Search> findByTenantIdsAndKeywords(
            @Param("tenantIds") java.util.List<String> tenantIds,
            @Param("userId") String userId,
            @Param("keywords") String keywords,
            Pageable pageable);

    /**
     * Python: delete_by_tenant_id(tenant_id)
     * Hard delete all searches for a tenant
     */
    @Modifying
    @Query("DELETE FROM Search s WHERE s.tenantId = :tenantId")
    int deleteByTenantId(@Param("tenantId") String tenantId);
}