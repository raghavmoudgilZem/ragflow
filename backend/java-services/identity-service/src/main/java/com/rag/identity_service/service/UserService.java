package com.rag.identity_service.service;

import com.rag.identity_service.config.JwtService;
import com.rag.identity_service.dto.response.AuthResponse;
import com.rag.identity_service.enumUtil.ColorScheme;
import com.rag.identity_service.enumUtil.TenantRole;
import com.rag.identity_service.exception.ConflictException;
import com.rag.identity_service.exception.ForbiddenException;
import com.rag.identity_service.exception.UnauthorizedException;
import com.rag.identity_service.model.RoleEntity;
import com.rag.identity_service.model.TenantEntity;
import com.rag.identity_service.model.UserEntity;
import com.rag.identity_service.model.UserTenantEntity;
import com.rag.identity_service.repo.RoleRepository;
import com.rag.identity_service.repo.TenantRepository;
import com.rag.identity_service.repo.UserRepository;
import com.rag.identity_service.repo.UserTenantRepository;
import com.rag.identity_service.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RoleRepository roleRepository;
    private final UserTenantRepository userTenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, TenantRepository tenantRepository,
                       RoleRepository roleRepository, UserTenantRepository userTenantRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.roleRepository = roleRepository;
        this.userTenantRepository = userTenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse registerUser(String nickname, String email, String rawPassword) {
        log.info("Processing creation request pipeline targeting workspace: {}", email);
        if (userRepository.existsByEmail(email)) {
            log.warn("Registration intercept: Email target address collision profile exists: {}", email);
            throw new ConflictException("An account with this email already exists.");
        }

        String userId = UUID.randomUUID().toString();
        UserEntity user = UserEntity.builder()
                .id(userId)
                .nickname(nickname)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .status(Constants.STATUS_ACTIVE)
                .avatar(null)
                .language("English")
                .colorScheme(ColorScheme.BRIGHT)
                .isActive(Constants.STATUS_INACTIVE)
                .build();
        userRepository.save(user);

        String tenantId = UUID.randomUUID().toString();
        TenantEntity tenant = TenantEntity.builder()
                .id(tenantId)
                .name(nickname + "'s workspace")
                .createdBy(userId)
                .status(Constants.STATUS_ACTIVE)
                .build();
        tenantRepository.save(tenant);

        RoleEntity ownerRole = roleRepository.findByRoleName(TenantRole.OWNER.name())
                .orElseThrow(() -> new IllegalStateException("Database baseline entities validation error."));

        UserTenantEntity mapping = UserTenantEntity.builder()
                .userId(userId)
                .tenantId(tenantId)
                .role(ownerRole)
                .status(Constants.STATUS_ACTIVE)
                .build();
        userTenantRepository.save(mapping);

        log.info("Registration successfully locked transaction user: {}, provisioned Tenant: {}", userId, tenantId);

        return AuthResponse.builder()
                .status(Constants.SUCCESS)
                .message("User registered and workspace provisioned successfully.")
                .data(AuthResponse.UserData.builder()
                        .userId(userId)
                        .nickname(nickname)
                        .email(email)
                        .tenantId(tenantId)
                        .role(ownerRole.getRoleName())
                        .status(Constants.STATUS_ACTIVE)
                        .build())
                .build();
    }

    @Transactional
    public AuthResponse login(String email, String password) {
        log.info("Processing verification context credentials validation for: {}", email);
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Email or password is incorrect."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            log.warn("Credentials check alert: Password validation failure targeting profile {}", email);
            throw new UnauthorizedException("Email or password is incorrect.");
        }

        user.setLastLoginTime(LocalDateTime.now());
        user.setIsActive(Constants.STATUS_ACTIVE);
        userRepository.save(user);

        UserTenantEntity primaryMapping = userTenantRepository.findFirstByUserIdAndStatus(user.getId(), Constants.STATUS_ACTIVE)
                .orElseThrow(() -> new ForbiddenException("User holds no active multi-tenant workspace configurations."));

        String token = jwtService.generateToken(user.getId(), user.getEmail(), primaryMapping.getTenantId(), primaryMapping.getRole().getRoleName());

        return AuthResponse.builder()
                .status(Constants.SUCCESS)
                .message("Authentication successful.")
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }
}