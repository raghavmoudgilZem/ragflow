package com.ragflow.retrieval.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

/**
 * Tests the binding and the startup gate on {@code retrieval.*}.
 *
 * <p>These assertions are about deployment safety rather than logic: the point of
 * binding these settings into a validated record was that a mistyped value fails
 * the context — naming the property — instead of quietly producing a client that
 * waits forever or a ranker whose ordering is inverted. Only a real bind proves
 * that, so this runs the actual binder rather than calling the canonical
 * constructors directly.
 *
 * <p>{@link RetrievalProperties} is registered through {@link PropertiesConfig} —
 * the same {@code @EnableConfigurationProperties} wiring that
 * {@code @ConfigurationPropertiesScan} performs on the application class in
 * production — and the assertions read the nested groups off the bound root, which
 * is exactly how the services receive them.
 */
class RetrievalPropertiesTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withConfiguration(AutoConfigurations.of(ValidationAutoConfiguration.class))
            .withUserConfiguration(PropertiesConfig.class)
            // sanitize is the one required group, so every case that is not about
            // its absence has to supply it.
            .withPropertyValues("retrieval.sanitize.max-query-length=1000");

    @Test
    void appliesDefaults_whenOnlyTheRequiredGroupIsConfigured() {
        // A deployment that tunes nothing optional must still start with a
        // working, bounded client rather than one with no timeout at all.
        contextRunner.run(context -> {
            RetrievalProperties properties = context.getBean(RetrievalProperties.class);
            assertThat(properties.rrf().k()).isEqualTo(60);

            RetrievalProperties.Rerank rerank = properties.rerank();
            assertThat(rerank.baseUrl()).isEqualTo("http://localhost:9380");
            assertThat(rerank.connectTimeoutMs()).isEqualTo(2000);
            assertThat(rerank.readTimeoutMs()).isEqualTo(4000);
            assertThat(rerank.topN()).isEqualTo(50);
        });
    }

    @Nested
    class Rrf {

        @Test
        void bindsK() {
            contextRunner
                    .withPropertyValues("retrieval.rrf.k=30")
                    .run(context -> assertThat(context.getBean(RetrievalProperties.class).rrf().k())
                            .isEqualTo(30));
        }

        @Test
        void kBelowOne_failsStartup() {
            // At k = 0 the denominator in 1 / (k + rank) stops damping the top of
            // each list; a negative value drives it through zero and inverts the
            // ordering. Neither is recoverable at request time.
            contextRunner
                    .withPropertyValues("retrieval.rrf.k=0")
                    .run(context -> assertThat(context)
                            .hasFailed()
                            .getFailure()
                            .hasStackTraceContaining("retrieval.rrf.k"));
        }
    }

    @Nested
    class Rerank {

        @Test
        void bindsEveryProperty() {
            contextRunner
                    .withPropertyValues(
                            "retrieval.rerank.base-url=http://rerank.internal:9380",
                            "retrieval.rerank.connect-timeout-ms=1500",
                            "retrieval.rerank.read-timeout-ms=3500",
                            "retrieval.rerank.top-n=25")
                    .run(context -> {
                        RetrievalProperties.Rerank rerank =
                                context.getBean(RetrievalProperties.class).rerank();
                        assertThat(rerank.baseUrl()).isEqualTo("http://rerank.internal:9380");
                        assertThat(rerank.connectTimeoutMs()).isEqualTo(1500);
                        assertThat(rerank.readTimeoutMs()).isEqualTo(3500);
                        assertThat(rerank.topN()).isEqualTo(25);
                    });
        }

        @Test
        void topNBelowOne_failsStartup() {
            // A config error should fail startup, not every request.
            contextRunner
                    .withPropertyValues("retrieval.rerank.top-n=0")
                    .run(context -> assertThat(context)
                            .hasFailed()
                            .getFailure()
                            .hasStackTraceContaining("retrieval.rerank.topN"));
        }

        @Test
        void nonPositiveTimeout_failsStartup() {
            // Zero means "wait forever" to the request factory, which is precisely
            // the outage this setting exists to prevent.
            contextRunner
                    .withPropertyValues("retrieval.rerank.connect-timeout-ms=0")
                    .run(context -> assertThat(context)
                            .hasFailed()
                            .getFailure()
                            .hasStackTraceContaining("retrieval.rerank.connectTimeoutMs"));
        }

        @Test
        void blankBaseUrl_failsStartup() {
            // Cascaded validation reports the binding path (retrieval.rerank.baseUrl)
            // rather than the kebab-case key that was set — still unambiguous, but
            // that is what the message names.
            contextRunner
                    .withPropertyValues("retrieval.rerank.base-url=")
                    .run(context -> assertThat(context)
                            .hasFailed()
                            .getFailure()
                            .hasStackTraceContaining("retrieval.rerank.baseUrl"));
        }
    }

    @Nested
    class Sanitize {

        @Test
        void bindsMaxQueryLength() {
            contextRunner
                    .withPropertyValues("retrieval.sanitize.max-query-length=250")
                    .run(context -> assertThat(
                            context.getBean(RetrievalProperties.class).sanitize().maxQueryLength())
                            .isEqualTo(250));
        }

        @Test
        void missingGroup_failsStartup() {
            // Deliberately not defaulted: the cap decides what reaches
            // Elasticsearch, so an unset value is a decision nobody made, not a
            // value to guess. The @Value this replaced had no default either.
            new ApplicationContextRunner()
                    .withConfiguration(AutoConfigurations.of(ValidationAutoConfiguration.class))
                    .withUserConfiguration(PropertiesConfig.class)
                    .run(context -> assertThat(context)
                            .hasFailed()
                            .getFailure()
                            .hasStackTraceContaining("retrieval.sanitize"));
        }

        @Test
        void nonPositiveMaxQueryLength_failsStartup() {
            // At zero every query truncates to the empty string and matches
            // nothing, which reads as broken search rather than broken config.
            contextRunner
                    .withPropertyValues("retrieval.sanitize.max-query-length=0")
                    .run(context -> assertThat(context)
                            .hasFailed()
                            .getFailure()
                            .hasStackTraceContaining("retrieval.sanitize.maxQueryLength"));
        }
    }

    @Nested
    class GroupIsolation {

        @Test
        void oneStagesSettingsDoNotDisturbTheOther() {
            // The two groups share a root; a value set on one must not reset the
            // other to something unconfigured.
            contextRunner
                    .withPropertyValues("retrieval.rerank.top-n=10")
                    .run(context -> {
                        RetrievalProperties properties = context.getBean(RetrievalProperties.class);
                        assertThat(properties.rerank().topN()).isEqualTo(10);
                        assertThat(properties.rrf().k()).isEqualTo(60);
                        assertThat(properties.sanitize().maxQueryLength()).isEqualTo(1000);
                    });
        }
    }

    /**
     * Registers {@link RetrievalProperties} the way {@code @ConfigurationPropertiesScan}
     * does in production, so the real binder and its startup validation run without
     * loading the whole application.
     */
    @EnableConfigurationProperties(RetrievalProperties.class)
    static class PropertiesConfig {
    }
}
