package com.ragflow.retrieval.config;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@Configuration
@ConfigurationProperties(prefix = "search")
public class SearchConfigurationProperties {

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double similarityThreshold;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double keywordWeight;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double semanticWeight;
}