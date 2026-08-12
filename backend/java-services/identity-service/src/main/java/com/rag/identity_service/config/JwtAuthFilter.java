package com.rag.identity_service.config;

import com.rag.identity_service.util.Constants;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Slf4j
@Component
public class JwtAuthFilter implements Filter {

    private final JwtService jwtService;
    private final SecurityProperties properties;

    public JwtAuthFilter(JwtService jwtService, SecurityProperties properties) {
        this.jwtService = jwtService;
        this.properties = properties;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String path = httpRequest.getRequestURI();

        for (String pattern : properties.getExcludedPaths()) {
            if (path.startsWith(pattern.replace("/**", ""))) {
                chain.doFilter(request, response);
                return;
            }
        }

        String authHeader = httpRequest.getHeader(Constants.AUTH_HEADER);
        if (authHeader == null || !authHeader.startsWith(Constants.BEARER_PREFIX)) {
            log.warn("Interception tracking failure: Missing valid Bearer prefix targeting path {}", path);
            httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid authorization context.");
            return;
        }

        String token = authHeader.substring(Constants.BEARER_PREFIX.length());
        try {
            Map<String, Object> claims = jwtService.validateAndParse(token);
            String email = (String) claims.get(Constants.CLAIM_EMAIL);
            String role = (String) claims.get(properties.getRoleClaimKey());

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(Constants.ROLE_PREFIX + role.toUpperCase());
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, Collections.singletonList(authority));

            authentication.setDetails(claims);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            chain.doFilter(request, response);
        } catch (Exception ex) {
            log.error("Clearing security context thread state wrapper following parsing anomalies", ex);
            SecurityContextHolder.clearContext();
            httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage());
        }
    }
}