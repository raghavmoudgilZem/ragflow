package com.rag.identity_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String status;
    private String message;
    private String accessToken;
    private String tokenType;
    private UserData data;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UserData {
        private String userId;
        private String nickname;
        private String email;
        private String tenantId;
        private String role;
        private Integer status;
    }
}
