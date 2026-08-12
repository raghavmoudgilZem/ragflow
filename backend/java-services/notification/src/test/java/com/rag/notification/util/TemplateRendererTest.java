package com.rag.notification.util;

import com.rag.notification.dto.response.TemplatePreviewResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class TemplateRendererTest {

    private TemplateRenderer templateRenderer;

    @BeforeEach
    void setUp() {
        templateRenderer = new TemplateRenderer();
    }

    @Test
    @DisplayName("Should correctly replace dynamic variables in subject and body")
    void render_SuccessfullyReplacesPlaceholders() {
        String subject = "Welcome, {{first_name}}!";
        String body = "Hello {{first_name}}, verify link: {{link}}";
        Map<String, String> data = Map.of("first_name", "Alex", "link", "https://ragflow.com");

        TemplatePreviewResponse response = templateRenderer.render(subject, body, data);

        assertThat(response.subject()).isEqualTo("Welcome, Alex!");
        assertThat(response.body()).isEqualTo("Hello Alex, verify link: https://ragflow.com");
    }

    @Test
    @DisplayName("Should handle missing dynamic parameters gracefully without throwing exceptions")
    void render_UnmatchedPlaceholdersRemainIntact() {
        String subject = "Welcome {{first_name}} {{last_name}}!";
        String body = "Hello {{first_name}}";
        Map<String, String> data = Map.of("first_name", "Alex");

        TemplatePreviewResponse response = templateRenderer.render(subject, body, data);

        assertThat(response.subject()).isEqualTo("Welcome Alex {{last_name}}!");
        assertThat(response.body()).isEqualTo("Hello Alex");
    }

    @Test
    @DisplayName("Should return unchanged text if sample data is null or empty")
    void render_EmptyData() {
        String subject = "Welcome {{first_name}}!";
        String body = "Body";

        TemplatePreviewResponse response = templateRenderer.render(subject, body, Map.of());

        assertThat(response.subject()).isEqualTo("Welcome {{first_name}}!");
        assertThat(response.body()).isEqualTo("Body");
    }
}