package com.ragflow.search.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * Response DTO for get_detail() — returns all 10 Python fields
 * plus joined user data: nickname, tenantAvatar.
 * <p>
 * Python fields mapped:
 *   id, avatar, tenant_id, name, description,
 *   created_by, search_config, update_time,
 *   User. Nickname, User.avatar.alias("tenant_avatar")
 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SearchDetailResponse(
        String id,
        String avatar,
        String tenantId,
        String name,
        String description,
        String createdBy,
        String searchConfig,
        Long updateTime,
        String nickname,
        String tenantAvatar
) {}