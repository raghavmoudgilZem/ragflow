package com.ragflow.retrieval.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.util.StringUtils;

@Converter
public class SearchConfigConverter implements AttributeConverter<SearchConfig, String> {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(SearchConfig attribute) {
        if (attribute == null) {
            attribute = SearchConfig.withDefaults();
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize SearchConfig to JSON", e);
        }
    }

    @Override
    public SearchConfig convertToEntityAttribute(String dbData) {
        if (!StringUtils.hasText(dbData)) {
            return SearchConfig.withDefaults();
        }
        try {
            return OBJECT_MAPPER.readValue(dbData, SearchConfig.class);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to deserialize SearchConfig from JSON: " + dbData, e);
        }
    }
}
