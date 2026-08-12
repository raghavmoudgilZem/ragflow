package com.ragflow.file.service.impl;


import com.ragflow.file.entity.FileEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PermissionServiceImplTest {

    private PermissionServiceImpl permissionService;

    private UUID userId;
    private UUID otherUserId;

    @BeforeEach
    void setUp() {
        permissionService = new PermissionServiceImpl();
        userId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("hasPermission Tests")
    class HasPermissionTests {

        @Test
        @DisplayName("Should return true when user is both tenant owner and creator")
        void hasPermission_WhenUserIsTenantOwnerAndCreator_ShouldReturnTrue() {
            // Arrange
            FileEntity file = FileEntity.builder()
                    .tenantId(userId)
                    .createdBy(userId)
                    .build();

            // Act
            boolean result = permissionService.hasPermission(file, userId);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Should return true when user is tenant owner but not creator")
        void hasPermission_WhenUserIsTenantOwnerOnly_ShouldReturnTrue() {
            // Arrange
            FileEntity file = FileEntity.builder()
                    .tenantId(userId)
                    .createdBy(otherUserId)
                    .build();

            // Act
            boolean result = permissionService.hasPermission(file, userId);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Should return true when user is creator but not tenant owner")
        void hasPermission_WhenUserIsCreatorOnly_ShouldReturnTrue() {
            // Arrange
            FileEntity file = FileEntity.builder()
                    .tenantId(otherUserId)
                    .createdBy(userId)
                    .build();

            // Act
            boolean result = permissionService.hasPermission(file, userId);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Should return false when user is neither tenant owner nor creator")
        void hasPermission_WhenUserIsNeitherTenantOwnerNorCreator_ShouldReturnFalse() {
            // Arrange
            FileEntity file = FileEntity.builder()
                    .tenantId(otherUserId)
                    .createdBy(otherUserId)
                    .build();

            // Act
            boolean result = permissionService.hasPermission(file, userId);

            // Assert
            assertThat(result).isFalse();
        }
    }
}
