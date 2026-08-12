package com.ragflow.retrieval.config;

import com.ragflow.retrieval.config.securityUtil.JwtValidationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private FilterChain filterChain;

    // Declared centrally to handle all strict-profile scenarios
    private JwtAuthenticationFilter filter;

    private final String[] excludedPaths = new String[]{"/public/**"};
    private final String roleClaimKey = "role";
    private final String defaultTenantId = "tenant-dev-123";

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        filter = new JwtAuthenticationFilter(jwtService, roleClaimKey, excludedPaths, false, defaultTenantId);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldNotFilter_ExcludedPath_ReturnsTrue() {
        when(request.getServletPath()).thenReturn("/public/health");
        assertTrue(filter.shouldNotFilter(request));
    }

    @Test
    void doFilterInternal_MissingHeaderNotLocal_Returns401() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);
        StringWriter stringWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(stringWriter));

        filter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertTrue(stringWriter.toString().contains("Missing Authorization token"));
        verifyNoInteractions(filterChain);
    }

    @Test
    void doFilterInternal_MissingHeaderAndIsLocal_InjectsMockAndSucceeds() throws Exception {
        // Isolated local variable prevents state leakage to other tests
        var localFilter = new JwtAuthenticationFilter(jwtService, roleClaimKey, excludedPaths, true, defaultTenantId);
        when(request.getHeader("Authorization")).thenReturn(null);

        localFilter.doFilterInternal(request, response, filterChain);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals("tenant-dev-12322", authentication.getPrincipal());

        Map<?, ?> details = (Map<?, ?>) authentication.getDetails();
        assertEquals(defaultTenantId, details.get("tenantId"));
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_InvalidToken_Returns401() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid-token");
        when(jwtService.validateAndParse("invalid-token")).thenThrow(new JwtValidationException("Invalid token"));

        StringWriter stringWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(stringWriter));

        filter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertTrue(stringWriter.toString().contains("Invalid token"));
    }

    @Test
    void doFilterInternal_ValidTokenMissingTenantId_Returns403() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer token-xyz");
        when(jwtService.validateAndParse("token-xyz")).thenReturn(Map.of("sub", "user123"));

        StringWriter stringWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(stringWriter));

        filter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
        assertTrue(stringWriter.toString().contains("Tenant information missing in token"));
    }

    @Test
    void doFilterInternal_FullyValidToken_AuthenticatesAndContinues() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer token-xyz");
        Map<String, Object> claims = Map.of("sub", "user123", "tenantId", "tenant-real-456");
        when(jwtService.validateAndParse("token-xyz")).thenReturn(claims);

        filter.doFilterInternal(request, response, filterChain);

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals("user123", authentication.getPrincipal());
        assertEquals(claims, authentication.getDetails());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_ExpiredToken_Returns401WithExpiredMessage() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer expired-token");
        when(jwtService.validateAndParse("expired-token")).thenThrow(new JwtValidationException("Token expired"));

        StringWriter stringWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(stringWriter));

        filter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        assertTrue(stringWriter.toString().contains("Token expired"));
        verifyNoInteractions(filterChain);
    }
}