package com.rag.identity_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rag.identity_service.config.JwtService;
import com.rag.identity_service.config.SecurityProperties;
import com.rag.identity_service.dto.UpdateRoleRequest;
import com.rag.identity_service.dto.response.TenantRoleResponse;
import com.rag.identity_service.service.TenantRoleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TenantRoleController.class)
@AutoConfigureMockMvc(addFilters = false)
class TenantRoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TenantRoleService tenantRoleService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private SecurityProperties securityProperties;

    @BeforeEach
    void setUpConfigurationContext() {
        when(securityProperties.getExcludedPaths()).thenReturn(new String[]{"/v1/user/register", "/v1/user/login"});
        when(securityProperties.getRoleClaimKey()).thenReturn("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void updateRole_Returns200Ok_StrippingStatusProperty() throws Exception {
        UpdateRoleRequest request = new UpdateRoleRequest();
        request.setRole("Admin");

        TenantRoleResponse mockResponse = TenantRoleResponse.builder()
                .userId("usr-456")
                .tenantId("tenant-789")
                .role("ADMIN")
                .status(null)
                .build();

        when(tenantRoleService.updateMemberRole(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(mockResponse);

        mockMvc.perform(put("/v1/tenants/tenant-789/users/usr-456/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("usr-456"))
                .andExpect(jsonPath("$.tenantId").value("tenant-789"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.status").doesNotExist());
    }

    @Test
    @WithMockUser(roles = "MEMBER")
    void verifyRole_Returns200Ok_IncludingStatusProperty() throws Exception {
        TenantRoleResponse mockResponse = TenantRoleResponse.builder()
                .userId("usr-456")
                .tenantId("tenant-789")
                .role("MEMBER")
                .status(1)
                .build();

        when(tenantRoleService.verifyMemberRole(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/v1/tenants/tenant-789/users/usr-456/role"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("usr-456"))
                .andExpect(jsonPath("$.tenantId").value("tenant-789"))
                .andExpect(jsonPath("$.role").value("MEMBER"))
                .andExpect(jsonPath("$.status").value(1));
    }
}