package com.rag.identity_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "security")
@Data
public class SecurityProperties {
    private String secret;
    private String roleClaimKey;
    private String[] excludedPaths;
}

