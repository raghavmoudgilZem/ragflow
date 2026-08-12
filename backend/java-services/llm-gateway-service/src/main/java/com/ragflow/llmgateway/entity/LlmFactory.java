package com.ragflow.llmgateway.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Arrays;
import java.util.List;

/**
 * A supported LLM provider (e.g. OpenAI, Anthropic, Bedrock). Reference/catalog data owned by the
 * {@code R__seed_catalog.sql} Flyway migration — this service only reads it.
 */
@Entity
@Table(name = "llm_factory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class LlmFactory {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "display_name", length = 128)
    private String displayName;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(name = "tags", nullable = false, length = 255)
    private String tags;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "credential_schema", nullable = false, columnDefinition = "json")
    private List<CredentialField> credentialSchema;

    @Column(name = "`rank`", nullable = false)
    private int rank;

    @Column(name = "launch_supported", nullable = false)
    private boolean launchSupported;

    @Column(name = "active", nullable = false)
    private boolean active;

    /**
     * Splits the CSV {@code tags} column into a trimmed, non-blank list — the single source of
     * truth for tag parsing, shared by tag-based filtering and API responses alike.
     */
    public List<String> getTagList() {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .toList();
    }
}
