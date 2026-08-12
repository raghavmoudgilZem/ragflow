package com.ragflow.search.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * ✅ FIX: No @Data — use explicit @Getter @Setter only.
 * -
 * @ Data generates toString/equals/hashCode which can cause
 * issues with JPA lazy loading and circular references.
 * -
 * Read-only reference entity — search-service NEVER writes to this table.
 * Used only for JOIN in getDetail() and getByTenantIds().
 * <p>
 * In microservice architecture, user data comes via X-User-Id header.
 * This entity is kept for backward-compatible JOIN with legacy data.
 * search-service does NOT write to this table.
 */
@Entity
@Table(name = "user")
@Getter
@Setter
public class User {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "avatar", columnDefinition = "TEXT")
    private String avatar;

    @Column(name = "status")
    private Integer status;
}