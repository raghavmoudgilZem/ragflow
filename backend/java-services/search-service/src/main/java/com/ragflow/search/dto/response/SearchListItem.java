package com.ragflow.search.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * List item for get_by_tenant_ids() response.
 * Python fields: id, avatar, tenant_id, name, description,
 *   created_by, status, update_time, create_time,
 *   User. Nickname, User.avatar.alias("tenant_avatar")
 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SearchListItem(
        String id,
        String avatar,
        String tenantId,
        String name,
        String description,
        String createdBy,
        Integer status,
        Long updateTime,
        Long createTime,
        String nickname,
        String tenantAvatar
) {}