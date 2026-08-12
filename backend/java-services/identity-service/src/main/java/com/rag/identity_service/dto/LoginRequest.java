package com.rag.identity_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Login identifier email cannot be blank.")
    @Email(message = "Please enter a structurally valid email.")
    private String email;

    @NotBlank(message = "Login verification password cannot be blank.")
    private String password;
}
