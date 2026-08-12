package com.ragflow.llmgateway.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
import org.springframework.boot.autoconfigure.cache.CacheProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Configures the Redis-backed {@code CacheManager} to serialize cached values as JSON (instead of
 * Boot's JDK-serialization default) and applies the {@code spring.cache.redis.*} properties —
 * these are otherwise ignored once a custom {@link RedisCacheConfiguration} bean is present.
 */
@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration(CacheProperties cacheProperties) {
        CacheProperties.Redis redisProperties = cacheProperties.getRedis();

        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer(cacheObjectMapper())));

        if (redisProperties.getTimeToLive() != null) {
            configuration = configuration.entryTtl(redisProperties.getTimeToLive());
        }
        if (!redisProperties.isCacheNullValues()) {
            configuration = configuration.disableCachingNullValues();
        }
        if (redisProperties.getKeyPrefix() != null) {
            configuration = configuration.prefixCacheNameWith(redisProperties.getKeyPrefix());
        }
        return configuration;
    }

    /**
     * Default typing (embedding {@code @class} metadata) is required to deserialize cached values
     * back into their concrete DTO type instead of a generic {@code LinkedHashMap}. Unlike
     * {@code new GenericJackson2JsonRedisSerializer()} — which accepts a subtype from ANY class on
     * the classpath via {@code LaissezFaireSubTypeValidator} — this restricts deserializable types
     * to our own DTOs plus {@code java.util} collections, so a compromised/rogue Redis value can't
     * force instantiation of an arbitrary class.
     */
    private ObjectMapper cacheObjectMapper() {
        PolymorphicTypeValidator typeValidator = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType("com.ragflow.llmgateway")
                .allowIfSubType("java.util")
                .build();
        return new ObjectMapper().activateDefaultTyping(typeValidator, useEverythingTyping(), JsonTypeInfo.As.PROPERTY);
    }

    /**
     * {@link ObjectMapper.DefaultTyping#EVERYTHING} is deprecated (Jackson 2.17+, no direct
     * replacement) because it types every value, including final ones — usually undesirable. We
     * need exactly that here: our cache root values ({@code FactoryResponse} et al.) are Java
     * records, which are implicitly final, and the more conservative {@code NON_FINAL} mode
     * specifically omits the type id for a final root value on the assumption there's no
     * ambiguity. But {@code GenericJackson2JsonRedisSerializer#deserialize} always reads into
     * {@code Object.class}, so without an embedded type id it can't tell what to instantiate.
     * Spring Data Redis's own default serializer setup — {@code GenericJackson2JsonRedisSerializer
     * .TypeResolverBuilder.forEverything(...)} — hits this exact same requirement and is built on
     * this same deprecated value internally, just behind its own non-deprecated public surface.
     */
    @SuppressWarnings("deprecation")
    private static ObjectMapper.DefaultTyping useEverythingTyping() {
        return ObjectMapper.DefaultTyping.EVERYTHING;
    }
}
