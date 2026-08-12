package com.rag.identity_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TenantRoleResponse {
    private String userId;
    private String tenantId;
    private String role;
    private Integer status;
}