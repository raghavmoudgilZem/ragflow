package com.rag.notification.util;

import com.rag.notification.dto.response.TemplatePreviewResponse;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class TemplateRenderer {

    public TemplatePreviewResponse render(String subject, String body, Map<String, String> sampleData) {
        String renderedSubject = replacePlaceholders(subject, sampleData);
        String renderedBody = replacePlaceholders(body, sampleData);
        return new TemplatePreviewResponse(renderedSubject, renderedBody);
    }

    private String replacePlaceholders(String content, Map<String, String> data) {
        if (content == null || data == null || data.isEmpty()) {
            return content;
        }
        String result = content;
        for (Map.Entry<String, String> entry : data.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            if (result.contains(placeholder)) {
                result = result.replace(placeholder, entry.getValue() != null ? entry.getValue() : "");
            }
        }
        return result;
    }
}