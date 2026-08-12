package com.rag.identity_service.service;

import com.rag.identity_service.dto.response.TenantRoleResponse;
import com.rag.identity_service.enumUtil.TenantRole;
import com.rag.identity_service.exception.BadRequestException;
import com.rag.identity_service.exception.ConflictException;
import com.rag.identity_service.exception.ForbiddenException;
import com.rag.identity_service.exception.ResourceNotFoundException;
import com.rag.identity_service.model.RoleEntity;
import com.rag.identity_service.model.UserTenantEntity;
import com.rag.identity_service.repo.RoleRepository;
import com.rag.identity_service.repo.UserTenantRepository;
import com.rag.identity_service.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class TenantRoleService {

    private final UserTenantRepository userTenantRepository;
    private final RoleRepository roleRepository;

    public TenantRoleService(UserTenantRepository userTenantRepository, RoleRepository roleRepository) {
        this.userTenantRepository = userTenantRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public TenantRoleResponse updateMemberRole(String tenantId, String targetUserId, String targetRoleStr, String callerRole) {
        log.info("Executing access tier promotion/demotion workflow row adjustments for user: {}", targetUserId);
        TenantRole newRole;
        try {
            newRole = TenantRole.valueOf(targetRoleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Requested target assignment role conversion enum value is invalid.");
        }

        if ( TenantRole.OWNER == newRole && !Constants.ROLE_OWNER.equalsIgnoreCase(callerRole)) {
            log.warn("RBAC security failure: Non-Owner component profile attempted to elevate mapping target to Owner.");
            throw new ForbiddenException("An ADMIN attempted to grant OWNER privileges.");
        }

        UserTenantEntity targetMembership = userTenantRepository.findByUserIdAndTenantId(targetUserId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user has no membership row for tenantId."));

        if (TenantRole.OWNER.name().equalsIgnoreCase(targetMembership.getRole().getRoleName()) &&  TenantRole.OWNER != newRole) {
            long remainingOwnersCount = userTenantRepository.countByTenantIdAndRoleRoleNameAndStatus(
                    tenantId, TenantRole.OWNER.name(), Constants.STATUS_ACTIVE);
            if (remainingOwnersCount <= 1) {
                log.warn("Aborting role updates logic to protect integrity: Workspace requires at least 1 Owner.");
                throw new ConflictException("Target is the tenant's only OWNER and workspace boundaries require retaining 1 owner.");
            }
        }

        RoleEntity assignedRole = roleRepository.findByRoleName(newRole.name())
                .orElseThrow(() -> new IllegalStateException("Domain enum definition row missing from lookup components."));

        targetMembership.setRole(assignedRole);
        userTenantRepository.save(targetMembership);

        return TenantRoleResponse.builder()
                .userId(targetUserId)
                .tenantId(tenantId)
                .role(assignedRole.getRoleName())
                .build();
    }

    @Transactional(readOnly = true)
    public TenantRoleResponse verifyMemberRole(String tenantId, String targetUserId, String callerUserId, String callerRole) {
        log.info("Processing database verification lookup query assertion mapping for user: {}", targetUserId);
        boolean authorized = targetUserId.equals(callerUserId) ||
                Constants.ROLE_OWNER.equalsIgnoreCase(callerRole) ||
                Constants.ROLE_ADMIN.equalsIgnoreCase(callerRole);

        if (!authorized) {
            throw new ForbiddenException("Caller is neither the target user nor OWNER/ADMIN.");
        }

        UserTenantEntity entity = userTenantRepository.findByUserIdAndTenantId(targetUserId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("No active tracking registration match located."));

        return TenantRoleResponse.builder()
                .userId(entity.getUserId())
                .tenantId(entity.getTenantId())
                .role(entity.getRole().getRoleName())
                .status(entity.getStatus())
                .build();
    }
}