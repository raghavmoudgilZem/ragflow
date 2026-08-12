package com.rag.identity_service.service;

import com.rag.identity_service.dto.response.TenantRoleResponse;
import com.rag.identity_service.enumUtil.TenantRole;
import com.rag.identity_service.exception.ConflictException;
import com.rag.identity_service.exception.ForbiddenException;
import com.rag.identity_service.model.RoleEntity;
import com.rag.identity_service.model.UserTenantEntity;
import com.rag.identity_service.repo.RoleRepository;
import com.rag.identity_service.repo.UserTenantRepository;
import com.rag.identity_service.util.Constants;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantRoleServiceTest {

    @Mock private UserTenantRepository userTenantRepository;
    @Mock private RoleRepository roleRepository;

    @InjectMocks private TenantRoleService tenantRoleService;

    @Test
    void updateMemberRole_Success_ReturnsTenantRoleResponse() {
        RoleEntity adminRole = new RoleEntity(2L, TenantRole.ADMIN.name(), null);
        UserTenantEntity targetMembership = UserTenantEntity.builder()
                .userId("target-user")
                .tenantId("tenant-id")
                .role(new RoleEntity("MEMBER"))
                .build();

        when(userTenantRepository.findByUserIdAndTenantId("target-user", "tenant-id")).thenReturn(Optional.of(targetMembership));
        when(roleRepository.findByRoleName(TenantRole.ADMIN.name())).thenReturn(Optional.of(adminRole));

        TenantRoleResponse response = tenantRoleService.updateMemberRole("tenant-id", "target-user", "ADMIN", "ROLE_OWNER");

        assertNotNull(response);
        assertEquals("ADMIN", response.getRole());
        assertNull(response.getStatus());
    }

    @Test
    void updateMemberRole_ThrowsForbiddenException_WhenAdminElevatesToOwner() {
        assertThrows(ForbiddenException.class, () ->
                tenantRoleService.updateMemberRole("tenant-id", "target", "OWNER", "ROLE_ADMIN")
        );
    }

    @Test
    void updateMemberRole_ThrowsConflictException_WhenDemotingLastWorkspaceOwner() {
        UserTenantEntity targetMembership = UserTenantEntity.builder()
                .userId("owner-user")
                .tenantId("tenant-id")
                .role(new RoleEntity("OWNER"))
                .build();

        when(userTenantRepository.findByUserIdAndTenantId("owner-user", "tenant-id")).thenReturn(Optional.of(targetMembership));
        when(userTenantRepository.countByTenantIdAndRoleRoleNameAndStatus("tenant-id", TenantRole.OWNER.name(), Constants.STATUS_ACTIVE)).thenReturn(1L);

        assertThrows(ConflictException.class, () ->
                tenantRoleService.updateMemberRole("tenant-id", "owner-user", "MEMBER", "ROLE_OWNER")
        );
    }

    @Test
    void verifyMemberRole_Success_IncludesStatusProperty() {
        UserTenantEntity entity = UserTenantEntity.builder()
                .userId("user-123")
                .tenantId("tenant-123")
                .role(new RoleEntity("MEMBER"))
                .status(Constants.STATUS_ACTIVE)
                .build();

        when(userTenantRepository.findByUserIdAndTenantId("user-123", "tenant-123")).thenReturn(Optional.of(entity));

        TenantRoleResponse response = tenantRoleService.verifyMemberRole("tenant-123", "user-123", "user-123", "ROLE_MEMBER");

        assertNotNull(response);
        assertEquals(Constants.STATUS_ACTIVE, response.getStatus());
    }
}