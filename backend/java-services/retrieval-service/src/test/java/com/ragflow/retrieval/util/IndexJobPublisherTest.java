package com.ragflow.retrieval.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessagePostProcessor;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import com.ragflow.retrieval.config.RabbitMQProperties;
import com.ragflow.retrieval.dto.request.IndexJobMessage;

/**
 * The publisher's whole job is the message envelope: which queue, what broker
 * priority, and durability. Priority is the interesting part — the queue is
 * declared with x-max-priority, so a HIGH job only overtakes a NORMAL one if the
 * numeric priority actually lands on the message.
 */
@ExtendWith(MockitoExtension.class)
class IndexJobPublisherTest {

    private static final String QUEUE = "index-jobs";

    @Mock
    private RabbitTemplate rabbitTemplate;

    private IndexJobPublisher publisher;

    @BeforeEach
    void setUp() {
        // Real properties record rather than a mock: it is a value holder, and
        // the queue name it carries is half of what this class is responsible for.
        publisher = new IndexJobPublisher(rabbitTemplate, new RabbitMQProperties(QUEUE, "5"));
    }

    private static IndexJobMessage message(String priority) {
        return IndexJobMessage.builder()
                .jobId(1L)
                .kbId("kb-1")
                .docId("doc-1")
                .tenantId("tenant-1")
                .docName("handbook.pdf")
                .storageType("MINIO")
                .bucket("parsed")
                .objectKey("tenant-1/doc-1.txt")
                .parserId("naive")
                .parserConfig(Map.of())
                .embeddingModelId("gemini-embedding-001")
                .priority(priority)
                .build();
    }

    /** Runs the post-processor the publisher handed to RabbitTemplate. */
    private MessageProperties publishedProperties(String priority) {
        publisher.publish(message(priority));

        ArgumentCaptor<MessagePostProcessor> captor = ArgumentCaptor.forClass(MessagePostProcessor.class);
        verify(rabbitTemplate).convertAndSend(eq(QUEUE), any(Object.class), captor.capture());

        Message amqpMessage = new Message(new byte[0], new MessageProperties());
        return captor.getValue().postProcessMessage(amqpMessage).getMessageProperties();
    }

    @Test
    void publishesToTheConfiguredQueue() {
        publisher.publish(message("NORMAL"));

        verify(rabbitTemplate).convertAndSend(eq(QUEUE), any(Object.class), any(MessagePostProcessor.class));
    }

    @Test
    void sendsTheMessageUnchanged() {
        IndexJobMessage message = message("NORMAL");

        publisher.publish(message);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(rabbitTemplate).convertAndSend(eq(QUEUE), captor.capture(), any(MessagePostProcessor.class));
        assertThat(captor.getValue()).isSameAs(message);
    }

    @Test
    void mapsLowPriorityToOne() {
        assertThat(publishedProperties("LOW").getPriority()).isEqualTo(1);
    }

    @Test
    void mapsNormalPriorityToFive() {
        assertThat(publishedProperties("NORMAL").getPriority()).isEqualTo(5);
    }

    @Test
    void mapsHighPriorityToNine() {
        assertThat(publishedProperties("HIGH").getPriority()).isEqualTo(9);
    }

    @Test
    void marksMessagesPersistentAndJson() {
        MessageProperties properties = publishedProperties("NORMAL");

        // Persistent delivery is what keeps queued jobs alive across a broker
        // restart — without it a submitted job silently disappears.
        assertThat(properties.getDeliveryMode()).isEqualTo(MessageDeliveryMode.PERSISTENT);
        assertThat(properties.getContentType()).isEqualTo("application/json");
    }

    @Test
    void rejectsAnUnrecognisedPriorityName() {
        // Priority reaches the publisher as a String; anything outside the enum
        // fails here rather than being quietly queued at some default level.
        assertThatThrownBy(() -> publisher.publish(message("URGENT")))
                .isInstanceOf(IllegalArgumentException.class);

        verifyNoInteractions(rabbitTemplate);
    }
}
