package com.ragflow.retrieval.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.retrieval.constants.RedisConstants;
import com.ragflow.retrieval.entity.SearchConfiguration;
import com.ragflow.retrieval.pubsub.SearchConfigurationSubscriber;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;

@Configuration
@RequiredArgsConstructor
public class RedisSubscriberConfig {

    private final SearchConfigurationSubscriber subscriber;
    private final ObjectMapper objectMapper;

    @Bean
    public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(
                listenerAdapter(),
                new ChannelTopic(RedisConstants.SEARCH_CONFIGURATION_CHANNEL)
        );
        return container;
    }

    @Bean
    public MessageListenerAdapter listenerAdapter() {
        MessageListenerAdapter adapter = new MessageListenerAdapter(subscriber, "receive");
        adapter.setSerializer(new Jackson2JsonRedisSerializer<>(objectMapper,SearchConfiguration.class));
        return adapter;
    }
}
