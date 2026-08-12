package com.ragflow.retrieval.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = SecurityConfig.class)
@EnableAutoConfiguration
@ActiveProfiles("local")
@TestPropertySource(properties = {
        "security.jwt.role-claim-key=http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
        "security.excluded-paths=/swagger-ui/**,/v3/api-docs/**,/actuator/health",
        "security.jwt.secret=super-secret-key-that-must-be-at-least-32-bytes-long!"
})
class SecurityConfigTest {

    @Autowired
    private SecurityFilterChain securityFilterChain;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void contextLoads_RegistersSecurityFilterChainBean() {
        assertNotNull(securityFilterChain, "SecurityFilterChain bean should be successfully registered in the context");
    }
}
