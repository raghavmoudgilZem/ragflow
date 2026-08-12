package com.ragflow.llmgateway.controller;

import com.ragflow.llmgateway.dto.response.CredentialFieldResponse;
import com.ragflow.llmgateway.dto.response.FactoryResponse;
import com.ragflow.llmgateway.exception.ResourceNotFoundException;
import com.ragflow.llmgateway.filter.CorrelationIdFilter;
import com.ragflow.llmgateway.filter.RateLimitFilter;
import com.ragflow.llmgateway.service.FactoryService;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * {@code @WebMvcTest} slice for {@link FactoryController} — exercises request mapping, parameter
 * binding, and {@link com.ragflow.llmgateway.exception.GlobalExceptionHandler} integration, with
 * the service layer mocked out. {@code CorrelationIdFilter}/{@code RateLimitFilter} are excluded
 * from the slice entirely (not just skipped at request time) — they have their own dedicated unit
 * tests, and {@code RateLimitFilter} needs a {@code RateLimitProperties} bean this slice doesn't
 * provide.
 */
@WebMvcTest(controllers = FactoryController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,
                classes = {RateLimitFilter.class, CorrelationIdFilter.class}))
class FactoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FactoryService factoryService;

    private static final FactoryResponse OPENAI_RESPONSE = new FactoryResponse(
            "OpenAI", "OpenAI", "https://cdn.internal/openai.svg",
            List.of("LLM", "TEXT EMBEDDING"),
            List.of(new CredentialFieldResponse("apiKey", "API Key", true, true)),
            100, true, true
    );

    @Nested
    class ListFactories {

        @Test
        void defaultsToActiveOnlyTrueAndNoTagFilter() throws Exception {
            // Arrange
            when(factoryService.getFactories(true, null)).thenReturn(List.of(OPENAI_RESPONSE));

            // Act & Assert
            mockMvc.perform(get("/api/v1/factories"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.statusCode").value(200))
                    .andExpect(jsonPath("$.data[0].name").value("OpenAI"))
                    .andExpect(jsonPath("$.data[0].tags[0]").value("LLM"));
            verify(factoryService).getFactories(true, null);
        }

        @Test
        void passesActiveFalseThrough_whenExplicitlyRequested() throws Exception {
            // Arrange
            when(factoryService.getFactories(false, null)).thenReturn(List.of());

            // Act & Assert
            mockMvc.perform(get("/api/v1/factories").param("active", "false"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data").isEmpty());
            verify(factoryService).getFactories(false, null);
        }

        @Test
        void passesTagParameterThrough() throws Exception {
            // Arrange
            when(factoryService.getFactories(true, "TEXT EMBEDDING")).thenReturn(List.of(OPENAI_RESPONSE));

            // Act & Assert
            mockMvc.perform(get("/api/v1/factories").param("tag", "TEXT EMBEDDING"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0].name").value("OpenAI"));
            verify(factoryService).getFactories(true, "TEXT EMBEDDING");
        }

        @Test
        void returnsEmptyArray_whenServiceReturnsNoMatches() throws Exception {
            // Arrange
            when(factoryService.getFactories(anyBoolean(), any())).thenReturn(List.of());

            // Act & Assert
            mockMvc.perform(get("/api/v1/factories").param("tag", "IMAGE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data").isEmpty());
        }
    }

    @Nested
    class GetFactory {

        @Test
        void returns200WithFactoryBody_whenFound() throws Exception {
            // Arrange
            when(factoryService.getFactoryByName("OpenAI")).thenReturn(OPENAI_RESPONSE);

            // Act & Assert
            mockMvc.perform(get("/api/v1/factories/{name}", "OpenAI"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.name").value("OpenAI"))
                    .andExpect(jsonPath("$.data.credentialSchema[0].key").value("apiKey"))
                    .andExpect(jsonPath("$.data.credentialSchema[0].secret").value(true));
        }

        @Test
        void returns404WithErrorEnvelope_whenServiceThrowsResourceNotFound() throws Exception {
            // Arrange
            when(factoryService.getFactoryByName("DoesNotExist"))
                    .thenThrow(new ResourceNotFoundException("LLM factory 'DoesNotExist' not found"));

            // Act & Assert
            mockMvc.perform(get("/api/v1/factories/{name}", "DoesNotExist"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.statusCode").value(404))
                    .andExpect(jsonPath("$.error").value("LLM factory 'DoesNotExist' not found"))
                    .andExpect(jsonPath("$.data").doesNotExist());
        }

        @Test
        void returns400_whenNameIsBlank() throws Exception {
            // Act & Assert — @NotBlank on the @PathVariable, enforced via @Validated on the controller
            mockMvc.perform(get("/api/v1/factories/{name}", " "))
                    .andExpect(status().isBadRequest());
        }
    }
}
