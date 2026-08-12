package com.ragflow.dataset.repository;

import com.ragflow.dataset.entity.Knowledgebase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DatasetRepository extends JpaRepository<Knowledgebase, UUID> {
    boolean existsByTenantIdAndNameIgnoreCaseAndStatus(String tenantId, String name, String number);
    List<Knowledgebase> findByTenantId(String tenantId);

}
