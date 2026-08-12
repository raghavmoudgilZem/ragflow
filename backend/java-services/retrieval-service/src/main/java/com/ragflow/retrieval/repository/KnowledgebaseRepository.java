package com.ragflow.retrieval.repository;

import com.ragflow.retrieval.dto.response.DatasetResponse;
import com.ragflow.retrieval.entity.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgebaseRepository extends JpaRepository<Dataset, String> {

    @Query(value = "SELECT id, name, doc_num, chunk_num, token_num, create_time AS createTime, update_time, tenant_id FROM knowledgebase WHERE (:tenantId IS NULL OR tenant_id = :tenantId) ORDER BY create_time DESC", nativeQuery = true)
    List<DatasetResponse> findRecentByTenant(@Param("tenantId") String tenantId);
}
