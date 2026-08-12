package com.rag.identity_service.util;

public class Constants {
    private Constants() {}

    public static final int STATUS_INACTIVE = 0;
    public static final int STATUS_ACTIVE = 1;

    public static final String CLAIM_SUB = "sub";
    public static final String CLAIM_EMAIL = "email";
    public static final String CLAIM_TENANT_ID = "tenantId";
    public static final String CLAIM_STATUS = "status";
    public static final String CLAIM_FRESH = "fresh";
    public static final String CLAIM_ISS = "iss";
    public static final String CLAIM_AUD = "aud";

    public static final String ROLE_PREFIX = "ROLE_";
    public static final String AUTH_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String SUCCESS = "Success";

    public static final String ROLE_OWNER = "ROLE_OWNER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
}
