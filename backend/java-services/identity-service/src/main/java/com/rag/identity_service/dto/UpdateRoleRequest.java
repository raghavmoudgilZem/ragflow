package com.rag.identity_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateRoleRequest {

    @NotBlank(message = "Target assignment workspace role cannot be blank.")
    @Pattern(regexp = "^(?i)(OWNER|ADMIN|MEMBER)$", message = "Role value must accurately match system configurations (OWNER, ADMIN, MEMBER).")
    private String role;
}