package com.ragflow.file.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class HeaderContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {

            String tenant = request.getHeader("X-Tenant-Id");
            String user = request.getHeader("X-User-Id");

            if (tenant != null) {
                RequestContext.setTenantId(UUID.fromString(tenant));
            }

            if (user != null) {
                RequestContext.setUserId(UUID.fromString(user));
            }

            filterChain.doFilter(request, response);

        } finally {

            RequestContext.clear();

        }

    }

}