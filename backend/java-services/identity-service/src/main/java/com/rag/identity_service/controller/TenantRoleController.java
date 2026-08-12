package com.rag.identity_service.controller;


import com.rag.identity_service.dto.UpdateRoleRequest;
import com.rag.identity_service.dto.response.TenantRoleResponse;
import com.rag.identity_service.exception.UnauthorizedException;
import com.rag.identity_service.service.TenantRoleService;
import com.rag.identity_service.util.EndPointConstants;
import com.rag.identity_service.util.SecurityContextUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(EndPointConstants.TENANT_ROLE_PATH)
public class TenantRoleController {

    private final TenantRoleService tenantRoleService;

    public TenantRoleController(TenantRoleService tenantRoleService) {
        this.tenantRoleService = tenantRoleService;
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> updateRole(@PathVariable String tenantId,
                                        @PathVariable String userId,
                                        @Valid @RequestBody UpdateRoleRequest body) {

        String callerRole = SecurityContextUtil.getCallerRole().orElseThrow(() -> new UnauthorizedException("Missing, invalid, or corrupt security authentication context."));

        TenantRoleResponse response = tenantRoleService.updateMemberRole(tenantId, userId, body.getRole(), callerRole);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> verifyRole(@PathVariable String tenantId,
                                        @PathVariable String userId) {

        String callerRole = SecurityContextUtil.getCallerRole().orElseThrow(() -> new UnauthorizedException("Missing, invalid, or corrupt security authentication context."));
        String callerUserId = SecurityContextUtil.getSubject().orElse("");

        TenantRoleResponse response = tenantRoleService.verifyMemberRole(tenantId, userId, callerUserId, callerRole);
        return ResponseEntity.ok(response);
    }
}