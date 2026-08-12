package com.ragflow.retrieval.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RabbitMQConfig {

    @Bean
    public Queue indexJobsQueue(RabbitMQProperties properties) {
        // durable, with a priority range so HIGH-priority submissions can
        // jump ahead of NORMAL/LOW in the worker pool
        return QueueBuilder.durable(properties.indexJobsName())
                .withArgument("x-max-priority", 10)
                .build();
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
