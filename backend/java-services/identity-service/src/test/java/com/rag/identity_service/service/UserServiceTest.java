package com.rag.identity_service.service;

import com.rag.identity_service.config.JwtService;
import com.rag.identity_service.dto.response.AuthResponse;
import com.rag.identity_service.enumUtil.TenantRole;
import com.rag.identity_service.exception.ConflictException;
import com.rag.identity_service.exception.UnauthorizedException;
import com.rag.identity_service.model.RoleEntity;
import com.rag.identity_service.model.UserEntity;
import com.rag.identity_service.model.UserTenantEntity;
import com.rag.identity_service.repo.RoleRepository;
import com.rag.identity_service.repo.TenantRepository;
import com.rag.identity_service.repo.UserRepository;
import com.rag.identity_service.repo.UserTenantRepository;
import com.rag.identity_service.util.Constants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private UserTenantRepository userTenantRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    private RoleEntity ownerRole;

    @BeforeEach
    void setUp() {
        ownerRole = new RoleEntity(1L, TenantRole.OWNER.name(), null);
    }

    @Test
    void registerUser_Success_PopulatesAuthResponse() {
        String email = "pavan@gmail.com";
        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode("rawPass")).thenReturn("hashedPass");
        when(roleRepository.findByRoleName(TenantRole.OWNER.name())).thenReturn(Optional.of(ownerRole));

        AuthResponse response = userService.registerUser("Pavan", email, "rawPass");

        assertNotNull(response);
        assertEquals(Constants.SUCCESS, response.getStatus());
        assertEquals("pavan@gmail.com", response.getData().getEmail());
        assertEquals("OWNER", response.getData().getRole());
        assertEquals(Constants.STATUS_ACTIVE, response.getData().getStatus());

        ArgumentCaptor<UserEntity> userCaptor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(userCaptor.capture());
        UserEntity user = userCaptor.getValue();
        assertNull(user.getAvatar());
        assertEquals("English", user.getLanguage());
        assertEquals(Constants.STATUS_INACTIVE, user.getIsActive());
    }

    @Test
    void registerUser_ThrowsConflictException_WhenUserExists() {
        when(userRepository.existsByEmail("exists@gmail.com")).thenReturn(true);
        assertThrows(ConflictException.class, () -> userService.registerUser("Pavan", "exists@gmail.com", "pass"));
    }

    @Test
    void login_Success_UpdatesTrackingMetricsAndReturnsAuthResponse() {
        String email = "pavan@gmail.com";
        UserEntity user = UserEntity.builder()
                .id("uuid")
                .email(email)
                .passwordHash("hashedPass")
                .status(Constants.STATUS_ACTIVE)
                .isActive(Constants.STATUS_INACTIVE)
                .build();

        UserTenantEntity mapping = UserTenantEntity.builder().tenantId("tenant-123").role(ownerRole).build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("rawPass", "hashedPass")).thenReturn(true);
        when(userTenantRepository.findFirstByUserIdAndStatus("uuid", Constants.STATUS_ACTIVE)).thenReturn(Optional.of(mapping));
        when(jwtService.generateToken(any(), any(), any(), any())).thenReturn("jwt-string");

        AuthResponse response = userService.login(email, "rawPass");

        assertEquals(Constants.SUCCESS, response.getStatus());
        assertEquals("jwt-string", response.getAccessToken());
        assertEquals(Constants.STATUS_ACTIVE, user.getIsActive());
        assertNotNull(user.getLastLoginTime());
    }

    @Test
    void login_ThrowsUnauthorizedException_OnPasswordMismatch() {
        String email = "pavan@gmail.com";
        UserEntity user = UserEntity.builder().email(email).passwordHash("hashedPass").build();
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPass", "hashedPass")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> userService.login(email, "wrongPass"));
    }
}