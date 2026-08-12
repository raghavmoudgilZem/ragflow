package com.rag.identity_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Nickname cannot be blank.")
    @Size(max = 100, message = "Nickname cannot exceed 100 characters.")
    private String nickname;

    @NotBlank(message = "Email address cannot be blank.")
    @Email(message = "Please provide a valid email format pattern.")
    @Size(max = 255, message = "Email cannot exceed 255 characters.")
    private String email;

    @NotBlank(message = "Password cannot be blank.")
    @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters long.")
    private String password;
}
