package com.rag.identity_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rag.identity_service.config.JwtService;
import com.rag.identity_service.config.SecurityProperties;
import com.rag.identity_service.dto.LoginRequest;
import com.rag.identity_service.dto.RegisterRequest;
import com.rag.identity_service.dto.response.AuthResponse;
import com.rag.identity_service.exception.ConflictException;
import com.rag.identity_service.exception.UnauthorizedException;
import com.rag.identity_service.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private SecurityProperties securityAppProperties;

    @BeforeEach
    void setUpConfigurationContext() {
        when(securityAppProperties.getExcludedPaths()).thenReturn(new String[]{"/v1/user/register", "/v1/user/login"});
        when(securityAppProperties.getRoleClaimKey()).thenReturn("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
    }

    @Test
    void register_Returns201Created_OnSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setNickname("Pavan");
        request.setEmail("pavan@gmail.com");
        request.setPassword("password123");

        AuthResponse mockResponse = AuthResponse.builder()
                .status("Success")
                .message("User registered and workspace provisioned successfully.")
                .data(AuthResponse.UserData.builder()
                        .userId("usr-123")
                        .nickname("Pavan")
                        .email("pavan@gmail.com")
                        .tenantId("tenant-123")
                        .role("OWNER")
                        .status(1)
                        .build())
                .build();

        when(userService.registerUser(anyString(), anyString(), anyString())).thenReturn(mockResponse);

        mockMvc.perform(post("/v1/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("Success"))
                .andExpect(jsonPath("$.data.userId").value("usr-123"))
                .andExpect(jsonPath("$.data.role").value("OWNER"))
                .andExpect(jsonPath("$.data.status").value(1));
    }

    @Test
    void register_Returns409Conflict_WhenUserExists() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setNickname("Pavan");
        request.setEmail("exists@gmail.com");
        request.setPassword("password123");

        when(userService.registerUser(any(), any(), any()))
                .thenThrow(new ConflictException("An account with this email already exists."));

        mockMvc.perform(post("/v1/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("CONFLICT_OCCURRED"))
                .andExpect(jsonPath("$.message").value("An account with this email already exists."));
    }

    @Test
    void login_Returns200Ok_WithToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("pavan@gmail.com");
        request.setPassword("password123");

        AuthResponse mockResponse = AuthResponse.builder()
                .status("Success")
                .message("Authentication successful.")
                .accessToken("jwt-signature-string")
                .tokenType("Bearer")
                .build();

        when(userService.login(anyString(), anyString())).thenReturn(mockResponse);

        mockMvc.perform(post("/v1/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Success"))
                .andExpect(jsonPath("$.accessToken").value("jwt-signature-string"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void login_Returns401Unauthorized_OnBadCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("wrong@gmail.com");
        request.setPassword("wrongpass");

        when(userService.login(any(), any()))
                .thenThrow(new UnauthorizedException("Email or password is incorrect."));

        mockMvc.perform(post("/v1/user/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message").value("Email or password is incorrect."));
    }
}