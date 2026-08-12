package com.ragflow.retrieval.util;

import com.ragflow.retrieval.config.RabbitMQProperties;
import com.ragflow.retrieval.dto.request.IndexJobMessage;
import com.ragflow.retrieval.enums.JobPriority;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessagePostProcessor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class IndexJobPublisher {

    private static final Map<JobPriority, Integer> PRIORITY_MAP = Map.of(
            JobPriority.LOW, 1,
            JobPriority.NORMAL, 5,
            JobPriority.HIGH, 9
    );

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQProperties properties;

    public IndexJobPublisher(RabbitTemplate rabbitTemplate,
                             RabbitMQProperties properties) {
        this.rabbitTemplate = rabbitTemplate;
        this.properties = properties;
    }

    public void publish(IndexJobMessage message) {
        int priority = PRIORITY_MAP.getOrDefault(
                JobPriority.valueOf(message.priority()), 5);

        MessagePostProcessor withPriority = msg -> {
            msg.getMessageProperties().setPriority(priority);
            msg.getMessageProperties().setContentType("application/json");
            msg.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
            return msg;
        };

        this.rabbitTemplate.convertAndSend(properties.indexJobsName(), message, withPriority);
    }
}
