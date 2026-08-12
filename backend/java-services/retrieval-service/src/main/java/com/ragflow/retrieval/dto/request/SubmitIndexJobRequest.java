package com.ragflow.retrieval.dto.request;

import com.ragflow.retrieval.enums.JobPriority;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.Collections;
import java.util.Map;

/**
 * Body of {@code POST /kb/{kbId}/index-jobs}. The kbId itself comes from the
 * path, not from here.
 *
 * <p>The optional fields are defaulted in the compact constructor rather than by
 * field initializers, which a record has no room for. That also makes the
 * defaults hold on every path into the record — Jackson, the builder, and direct
 * construction alike — where the initializers this replaced applied only to
 * Jackson's, leaving a builder-made request with a null {@code priority} that
 * failed later with an NPE instead of being defaulted here.
 *
 * @param docId            document to index
 * @param tenantId         tenant the document belongs to; decides which
 *                         Elasticsearch index its chunks are written to
 * @param docName          display name, indexed alongside each chunk
 * @param parsedContentRef where the parsed content can be read from
 * @param parserId         chunk method to apply; defaults to {@code naive}
 * @param parserConfig     per-job chunking knobs; defaults to empty
 * @param embeddingModelId model to embed the chunks with
 * @param priority         queue priority; defaults to {@code NORMAL}
 */
@Builder
public record SubmitIndexJobRequest(

        @NotBlank(message = "docId is required")
        String docId,

        @NotBlank(message = "tenantId is required")
        String tenantId,

        @NotBlank(message = "docName is required")
        String docName,

        @NotNull(message = "parsedContentRef is required")
        @Valid
        ParsedContentRef parsedContentRef,

        String parserId,

        Map<String, Object> parserConfig,

        @NotBlank(message = "embeddingModelId is required")
        String embeddingModelId,

        JobPriority priority) {

    private static final String DEFAULT_PARSER_ID = "naive";

    public SubmitIndexJobRequest {
        parserId = parserId == null ? DEFAULT_PARSER_ID : parserId;
        parserConfig = parserConfig == null ? Collections.emptyMap() : parserConfig;
        priority = priority == null ? JobPriority.NORMAL : priority;
    }
}
