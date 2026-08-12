package com.rag.identity_service.repo;

import com.rag.identity_service.model.TenantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<TenantEntity, String> {
}