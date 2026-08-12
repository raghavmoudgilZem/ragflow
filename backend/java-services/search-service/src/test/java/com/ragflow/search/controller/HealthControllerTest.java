package com.ragflow.search.controller;

import com.ragflow.search.dto.response.HealthResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "spring.data.redis.host=localhost",
        "spring.data.redis.port=6379",
        "spring.data.redis.password="
})
@DisplayName("HealthController — Day 1 Tests")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // ── Test 1 ───────────────────────────────────────────────────────────────
    @Test
    @DisplayName("GET /health → 200 OK with status UP")
    void health_returns200_withStatusUp() throws Exception {
        mockMvc.perform(get("/health")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("search-service"))
                .andExpect(jsonPath("$.port").value(9407))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    // ── Test 2 ───────────────────────────────────────────────────────────────
    @Test
    @DisplayName("GET /health → response body is valid HealthResponse structure")
    void health_returnsValidHealthResponseStructure() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists())
                .andExpect(jsonPath("$.service").exists())
                .andExpect(jsonPath("$.port").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    // ── Test 3 ───────────────────────────────────────────────────────────────
    @Test
    @DisplayName("GET /health → accessible without any Authorization header (no JWT needed)")
    void health_accessibleWithoutAuth() throws Exception {
        // Gateway handles auth — this endpoint must be open
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
    }

    // ── Test 4 ───────────────────────────────────────────────────────────────
    @Test
    @DisplayName("GET /ping → 200 OK with service running message")
    void ping_returns200_withRunningMessage() throws Exception {
        mockMvc.perform(get("/ping"))
                .andExpect(status().isOk())
                .andExpect(content().string(
                        org.hamcrest.Matchers.containsString("search-service")));
    }

    // ── Test 5 ───────────────────────────────────────────────────────────────
    @Test
    @DisplayName("GET /ping → accessible without Authorization header")
    void ping_accessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/ping"))
                .andExpect(status().isOk());
    }

    // ── Test 6 ───────────────────────────────────────────────────────────────
    @Test
    @DisplayName("HealthResponse.up() → returns correct static factory values")
    void healthResponse_upFactory_returnsCorrectValues() {
        HealthResponse response = HealthResponse.up();

        // Use record accessor methods (no "get" prefix)
        assertThat(response.status()).isEqualTo("UP");
        assertThat(response.service()).isEqualTo("search-service");
        assertThat(response.port()).isEqualTo(9407);
        assertThat(response.timestamp()).isNotNull().isNotEmpty();
    }
}