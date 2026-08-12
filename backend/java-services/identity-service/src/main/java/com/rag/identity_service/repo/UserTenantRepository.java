package com.rag.identity_service.repo;

import com.rag.identity_service.model.UserTenantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserTenantRepository extends JpaRepository<UserTenantEntity, Long> {
    Optional<UserTenantEntity> findByUserIdAndTenantId(String userId, String tenantId);
    Optional<UserTenantEntity> findFirstByUserIdAndStatus(String userId, int status);
    long countByTenantIdAndRoleRoleNameAndStatus(String tenantId, String roleName, int status);}
