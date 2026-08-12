package com.ragflow.retrieval.config;

import com.ragflow.retrieval.config.securityUtil.FilterErrorWriter;
import com.ragflow.retrieval.util.Constants;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@Slf4j
public class SecurityConfig {

    @Value("${spring.profiles.active:strict}")
    private String activeProfile;

    @Value("${tenant.dev-default-id:tenant-dev-123}")
    private String defaultTenantId;

    @Value("${security.jwt.role-claim-key:}")
    private String roleClaimKey;

    @Value("${security.excluded-paths:}")
    private String[] excludedPaths;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtService jwtService) throws Exception {
        boolean isLocal = Constants.LOCAL_PROFILE.equals(activeProfile);

        if (isLocal) {
            log.warn("SECURITY BYPASS ON DEMAND ACTIVE — local profile: Mock applied ONLY on missing tokens");
        }

        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(excludedPaths).permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) ->
                                FilterErrorWriter.writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Missing Authorization token"))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                FilterErrorWriter.writeErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "Access Denied"))
                )
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtService, roleClaimKey, excludedPaths, isLocal, defaultTenantId),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

}
