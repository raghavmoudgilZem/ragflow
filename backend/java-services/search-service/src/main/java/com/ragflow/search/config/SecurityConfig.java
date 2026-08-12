package com.ragflow.search.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * -
 * WHY this is needed at service level:
 * -
 * 1. Spring Security is on the classpath (spring-boot-starter-security dependency).
 *    Without this config, Spring Boot autoconfigures basic auth and blocks ALL
 *    requests including /health — service would be unusable.
 * -
 * 2. YARP Gateway handles JWT validation. This service receives pre-validated
 *    requests with X-Tenant-Id and X-User-Id headers already injected.
 *    So we permit all traffic here — no duplicate JWT validation needed.
 * -
 * 3. CSRF is disabled — stateless REST API, no session, no browser forms.
 * -
 * If the team decides to remove spring-security dependency entirely,
 * this class can be deleted. But as long as the starter is on the classpath,
 * this config is required to prevent autoconfigured basic auth.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF — stateless REST service
                .csrf(AbstractHttpConfigurer::disable)
                // Stateless — no session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Gateway handles JWT — permit all traffic at service level
                .authorizeHttpRequests(auth ->
                        auth.anyRequest().permitAll());

        return http.build();
    }
}