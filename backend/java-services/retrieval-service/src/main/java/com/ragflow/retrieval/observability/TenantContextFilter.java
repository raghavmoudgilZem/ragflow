package com.ragflow.retrieval.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10) // early, but after the OTel servlet filter
public class TenantContextFilter extends OncePerRequestFilter {

    public static final String TENANT_HEADER = "X-Tenant-Id";
    public static final String MDC_TENANT_KEY = "tenant_id";
    private static final String UNKNOWN_TENANT = "UNKNOWN";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String tenantId = request.getHeader(TENANT_HEADER);
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = UNKNOWN_TENANT;
        }

        try {
            MDC.put(MDC_TENANT_KEY, tenantId);
            chain.doFilter(request, response);
        } finally {
            // Always clear MDC — thread pools reuse threads across requests,
            // so a stale tenant_id would otherwise leak into the next request's logs.
            MDC.remove(MDC_TENANT_KEY);
        }
    }
}