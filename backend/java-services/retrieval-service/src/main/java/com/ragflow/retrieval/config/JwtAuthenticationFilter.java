package com.ragflow.retrieval.config;


import com.ragflow.retrieval.config.securityUtil.FilterErrorWriter;
import com.ragflow.retrieval.config.securityUtil.JwtValidationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final String roleClaimKey;
    private final List<String> excludedPaths;
    private final boolean isLocal;
    private final String defaultTenantId;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(JwtService jwtService, String roleClaimKey,
                                   String[] excludedPaths, boolean isLocal, String defaultTenantId) {
        this.jwtService = jwtService;
        this.roleClaimKey = roleClaimKey;
        this.excludedPaths = List.of(excludedPaths);
        this.isLocal = isLocal;
        this.defaultTenantId = defaultTenantId;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return excludedPaths.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            if (isLocal) {
                log.info("Inject Mock Details: Bearer token not present and the profiles are local");
                injectMockAuthentication();
                filterChain.doFilter(request, response);
                return;
            }
            FilterErrorWriter.writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Missing Authorization token");
            return;
        }

        String token = header.substring(7);
        Map<String, Object> claims;

        try {
            claims = jwtService.validateAndParse(token);
        } catch (JwtValidationException e) {
            log.error("Exception at JWT Verification: ", e);
            FilterErrorWriter.writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
            return;
        }
        if(ObjectUtils.isEmpty(claims.get("tenantId"))){
            log.info("TenantId is missing in the provided token");
            FilterErrorWriter.writeErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "Tenant information missing in token");
            return;
        }

        var authentication = new UsernamePasswordAuthenticationToken(claims.get("sub"), null, Collections.emptyList());
        authentication.setDetails(claims);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);

    }

    private void injectMockAuthentication() {
        log.info("Setting the Mock Authentication Object after bypassing the authentication check locally");
        Map<String, Object> mockClaims = Map.of(
                "sub", "tenant-dev-12322",
                "email", "ahmed@yahoo.com",
                "tenantId", defaultTenantId,
                roleClaimKey, "Owner",
                "status", "Active",
                "fresh", "true",
                "exp", 1783321024L,
                "iss", "ragflow.identity",
                "aud", "ragflow.api"
        );

        var authentication = new UsernamePasswordAuthenticationToken(mockClaims.get("sub"), null, Collections.emptyList());
        authentication.setDetails(mockClaims);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}