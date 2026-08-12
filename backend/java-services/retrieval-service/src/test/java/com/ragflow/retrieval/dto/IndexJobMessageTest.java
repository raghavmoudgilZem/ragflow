package com.ragflow.retrieval.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;

import com.ragflow.retrieval.dto.request.IndexJobMessage;
import com.ragflow.retrieval.dto.request.ParsedContentRef;
import com.ragflow.retrieval.dto.response.IndexJobResponse;
import com.ragflow.retrieval.entity.IndexJob;
import com.ragflow.retrieval.enums.JobPriority;
import com.ragflow.retrieval.enums.JobStatus;

/**
 * The job row is the source of truth; both the queue message and the API
 * response are projections of it. The mapping tests pin those projections, and
 * the round-trip test pins the part no unit test of either side would catch: the
 * message must survive the broker's own converter, since producer and consumer
 * only ever meet as JSON.
 */
class IndexJobMessageTest {

    private static IndexJob job() {
        return IndexJob.builder()
                .jobId(42L)
                .kbId("kb-1")
                .docId("doc-1")
                .tenantId("tenant-1")
                .docName("handbook.pdf")
                .storageType("MINIO")
                .storageBucket("parsed")
                .storageObjectKey("tenant-1/doc-1.txt")
                .parserId("naive")
                .parserConfig(Map.of("chunkTokenSize", 256))
                .embeddingModelId("gemini-embedding-001")
                .priority(JobPriority.HIGH)
                .status(JobStatus.QUEUED)
                .submittedAt(Instant.parse("2026-07-30T10:15:30Z"))
                .build();
    }

    // -------------------------------------------------------- message mapping

    @Test
    void from_carriesEverythingTheWorkerNeeds() {
        IndexJobMessage message = IndexJobMessage.from(job());

        // The worker never re-reads the job row for these, so anything missing
        // here cannot be recovered downstream.
        assertThat(message.jobId()).isEqualTo(42L);
        assertThat(message.kbId()).isEqualTo("kb-1");
        assertThat(message.docId()).isEqualTo("doc-1");
        assertThat(message.tenantId()).isEqualTo("tenant-1");
        assertThat(message.docName()).isEqualTo("handbook.pdf");
        assertThat(message.parserId()).isEqualTo("naive");
        assertThat(message.parserConfig()).containsEntry("chunkTokenSize", 256);
        assertThat(message.embeddingModelId()).isEqualTo("gemini-embedding-001");
    }

    @Test
    void from_renamesTheFlattenedStorageColumnsToRefFields() {
        IndexJobMessage message = IndexJobMessage.from(job());

        // storage_bucket/storage_object_key on the row, bucket/objectKey on the
        // wire — an easy pair to cross-wire.
        assertThat(message.storageType()).isEqualTo("MINIO");
        assertThat(message.bucket()).isEqualTo("parsed");
        assertThat(message.objectKey()).isEqualTo("tenant-1/doc-1.txt");
    }

    @Test
    void from_sendsPriorityAsItsEnumName() {
        // The publisher maps this string back through JobPriority to a broker
        // priority, so the exact name matters.
        assertThat(IndexJobMessage.from(job()).priority()).isEqualTo("HIGH");
    }

    // ------------------------------------------------------------- round trip

    @Test
    void survivesTheBrokerJsonConverter() {
        // Exactly the converter RabbitMQConfig registers: the producer and the
        // @RabbitListener meet only as JSON, so a message that serialises but
        // will not deserialise breaks every job with no compile-time warning.
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        IndexJobMessage original = IndexJobMessage.from(job());

        Message amqpMessage = converter.toMessage(original, new MessageProperties());
        Object received = converter.fromMessage(amqpMessage);

        assertThat(received).isInstanceOf(IndexJobMessage.class);
        assertThat(received).isEqualTo(original);
    }

    // ------------------------------------------------------- response mapping

    @Test
    void response_exposesOnlyTheJobHandle() {
        IndexJobResponse response = IndexJobResponse.from(job());

        assertThat(response.jobId()).isEqualTo(42L);
        assertThat(response.kbId()).isEqualTo("kb-1");
        assertThat(response.docId()).isEqualTo("doc-1");
        assertThat(response.status()).isEqualTo("QUEUED");
        assertThat(response.submittedAt()).isEqualTo(Instant.parse("2026-07-30T10:15:30Z"));
    }

    @Test
    void response_reportsWhateverStatusTheJobIsIn() {
        IndexJob running = job();
        running.setStatus(JobStatus.RUNNING);

        assertThat(IndexJobResponse.from(running).status()).isEqualTo("RUNNING");
    }

    // ------------------------------------------------------------ ref plumbing

    @Test
    void parsedContentRefEqualityIsByValue() {
        // The service compares and logs refs; identity semantics here would
        // make those checks meaningless.
        ParsedContentRef first = new ParsedContentRef("MINIO", "parsed", "k");
        ParsedContentRef second = new ParsedContentRef("MINIO", "parsed", "k");

        assertThat(first).isEqualTo(second).hasSameHashCodeAs(second);
    }
}
