package com.ragflow.retrieval.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.retrieval.dto.request.ParsedContentRef;
import com.ragflow.retrieval.dto.request.SubmitIndexJobRequest;
import com.ragflow.retrieval.enums.JobPriority;

/**
 * The optional fields default in the record's compact constructor, which is the
 * one place every caller goes through. That matters more than it looks: as a
 * class with field initializers, the defaults applied only when Jackson used the
 * no-arg constructor — Lombok's builder ignored them (it warned about exactly
 * this), so a builder-made request carried a null {@code priority} that only
 * failed later, deep in the publisher.
 */
class SubmitIndexJobRequestTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final String MINIMAL_JSON = """
            {
              "docId": "doc-1",
              "tenantId": "tenant-1",
              "docName": "handbook.pdf",
              "parsedContentRef": {
                "storageType": "MINIO",
                "bucket": "parsed",
                "objectKey": "tenant-1/doc-1.txt"
              },
              "embeddingModelId": "gemini-embedding-001"
            }
            """;

    private static SubmitIndexJobRequest.SubmitIndexJobRequestBuilder minimal() {
        return SubmitIndexJobRequest.builder()
                .docId("doc-1")
                .tenantId("tenant-1")
                .docName("handbook.pdf")
                .parsedContentRef(new ParsedContentRef("MINIO", "parsed", "tenant-1/doc-1.txt"))
                .embeddingModelId("gemini-embedding-001");
    }

    // ---------------------------------------------------------------- defaults

    @Test
    void defaultsTheOptionalFieldsWhenBuilt() {
        SubmitIndexJobRequest request = minimal().build();

        assertThat(request.parserId()).isEqualTo("naive");
        assertThat(request.priority()).isEqualTo(JobPriority.NORMAL);
        assertThat(request.parserConfig()).isNotNull().isEmpty();
    }

    @Test
    void defaultsTheOptionalFieldsWhenDeserialized() throws Exception {
        SubmitIndexJobRequest request = MAPPER.readValue(MINIMAL_JSON, SubmitIndexJobRequest.class);

        // A caller omitting the optional fields is the common case, and the
        // publisher calls priority().name() with no null check.
        assertThat(request.parserId()).isEqualTo("naive");
        assertThat(request.priority()).isEqualTo(JobPriority.NORMAL);
        assertThat(request.parserConfig()).isNotNull().isEmpty();
    }

    @Test
    void defaultsFieldsSentExplicitlyAsNull() throws Exception {
        String json = MINIMAL_JSON.trim().substring(0, MINIMAL_JSON.trim().length() - 1)
                + ", \"parserId\": null, \"priority\": null, \"parserConfig\": null}";

        // An explicit null is not the same as an omitted field to Jackson, and
        // it used to overwrite the initializer with null.
        SubmitIndexJobRequest request = MAPPER.readValue(json, SubmitIndexJobRequest.class);

        assertThat(request.parserId()).isEqualTo("naive");
        assertThat(request.priority()).isEqualTo(JobPriority.NORMAL);
        assertThat(request.parserConfig()).isEmpty();
    }

    @Test
    void keepsExplicitlyProvidedValues() {
        SubmitIndexJobRequest request = minimal()
                .parserId("laws")
                .priority(JobPriority.HIGH)
                .parserConfig(Map.of("chunkTokenSize", 256))
                .build();

        assertThat(request.parserId()).isEqualTo("laws");
        assertThat(request.priority()).isEqualTo(JobPriority.HIGH);
        assertThat(request.parserConfig()).containsEntry("chunkTokenSize", 256);
    }

    // ------------------------------------------------------------- deserialize

    @Test
    void bindsEveryFieldFromJson() throws Exception {
        SubmitIndexJobRequest request = MAPPER.readValue(MINIMAL_JSON, SubmitIndexJobRequest.class);

        // The canonical constructor is what Jackson uses for a record, so a
        // component renamed without touching the API contract shows up here.
        assertThat(request.docId()).isEqualTo("doc-1");
        assertThat(request.tenantId()).isEqualTo("tenant-1");
        assertThat(request.docName()).isEqualTo("handbook.pdf");
        assertThat(request.embeddingModelId()).isEqualTo("gemini-embedding-001");
        assertThat(request.parsedContentRef())
                .isEqualTo(new ParsedContentRef("MINIO", "parsed", "tenant-1/doc-1.txt"));
    }
}
