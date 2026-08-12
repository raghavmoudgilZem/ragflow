package com.ragflow.llmgateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ragflow.llmgateway.config.RateLimitProperties;
import com.ragflow.llmgateway.constants.HeaderConstants;
import com.ragflow.llmgateway.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for {@link RateLimitFilter}. Uses small, deterministic bucket capacities so tests
 * complete well within a token-refill interval and stay flake-free.
 */
class RateLimitFilterTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Nested
    class Disabled {

        @Test
        void alwaysPassesThrough_regardlessOfRequestCount() throws Exception {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(false, 1), objectMapper);
            FilterChain chain = mock(FilterChain.class);

            // Act — exceed what would be the capacity if enabled
            for (int i = 0; i < 5; i++) {
                filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);
            }

            // Assert
            verify(chain, times(5)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
        }

        @Test
        void doesNotSetRateLimitHeaders() throws Exception {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(false, 1), objectMapper);
            MockHttpServletResponse response = new MockHttpServletResponse();

            // Act
            filter.doFilter(new MockHttpServletRequest(), response, mock(FilterChain.class));

            // Assert
            assertThat(response.getHeader(HeaderConstants.RATE_LIMIT_REMAINING)).isNull();
        }
    }

    @Nested
    class Enabled {

        @Test
        void allowsRequestsUpToCapacity_andDecrementsRemainingHeader() throws Exception {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 3), objectMapper);
            FilterChain chain = mock(FilterChain.class);

            // Act & Assert — 3 requests within a capacity-3 bucket all pass, remaining counts down
            for (int expectedRemaining = 2; expectedRemaining >= 0; expectedRemaining--) {
                MockHttpServletResponse response = new MockHttpServletResponse();
                filter.doFilter(new MockHttpServletRequest(), response, chain);
                assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());
                assertThat(response.getHeader(HeaderConstants.RATE_LIMIT_REMAINING))
                        .isEqualTo(String.valueOf(expectedRemaining));
            }
            verify(chain, times(3)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
        }

        @Test
        void rejectsTheRequestThatExceedsCapacity_with429AndRetryAfter() throws Exception {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 1), objectMapper);
            FilterChain chain = mock(FilterChain.class);
            filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain); // consumes the 1 token

            // Act
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(new MockHttpServletRequest(), response, chain);

            // Assert
            assertThat(response.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
            assertThat(response.getHeader(HeaderConstants.RETRY_AFTER)).isNotNull();
            assertThat(Long.parseLong(response.getHeader(HeaderConstants.RETRY_AFTER))).isGreaterThanOrEqualTo(1);
            assertThat(response.getHeader(HeaderConstants.RATE_LIMIT_REMAINING)).isEqualTo("0");
            assertThat(response.getContentType()).isEqualTo(MediaType.APPLICATION_JSON_VALUE);
            verify(chain, times(1)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
        }

        @Test
        void rejectedResponseBody_isAWellFormedApiResponseErrorEnvelope() throws Exception {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 1), objectMapper);
            FilterChain chain = mock(FilterChain.class);
            filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);
            MockHttpServletResponse response = new MockHttpServletResponse();

            // Act
            filter.doFilter(new MockHttpServletRequest(), response, chain);

            // Assert
            ApiResponse<?> body = objectMapper.readValue(response.getContentAsString(), ApiResponse.class);
            assertThat(body.success()).isFalse();
            assertThat(body.statusCode()).isEqualTo(429);
            assertThat(body.error()).isEqualTo("Rate limit exceeded, retry later");
        }

        @Test
        void differentClients_haveIndependentBuckets() throws Exception {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 1), objectMapper);
            FilterChain chain = mock(FilterChain.class);
            MockHttpServletRequest clientA = new MockHttpServletRequest();
            clientA.setRemoteAddr("10.0.0.1");
            MockHttpServletRequest clientB = new MockHttpServletRequest();
            clientB.setRemoteAddr("10.0.0.2");

            // Act — exhaust client A's single-token bucket
            filter.doFilter(clientA, new MockHttpServletResponse(), chain);
            MockHttpServletResponse clientAResponse = new MockHttpServletResponse();
            filter.doFilter(clientA, clientAResponse, chain);

            // Client B, never called before, should still have its full bucket
            MockHttpServletResponse clientBResponse = new MockHttpServletResponse();
            filter.doFilter(clientB, clientBResponse, chain);

            // Assert
            assertThat(clientAResponse.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
            assertThat(clientBResponse.getStatus()).isEqualTo(HttpStatus.OK.value());
        }

        @Test
        void usesFirstAddressInXForwardedForHeader_overRemoteAddr() throws Exception {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 1), objectMapper);
            FilterChain chain = mock(FilterChain.class);

            MockHttpServletRequest first = new MockHttpServletRequest();
            first.setRemoteAddr("proxy-internal-ip");
            first.addHeader(HeaderConstants.FORWARDED_FOR, "203.0.113.5, 70.41.3.18");
            filter.doFilter(first, new MockHttpServletResponse(), chain); // consumes the token for "203.0.113.5"

            MockHttpServletRequest second = new MockHttpServletRequest();
            second.setRemoteAddr("proxy-internal-ip");
            second.addHeader(HeaderConstants.FORWARDED_FOR, "203.0.113.5, 99.99.99.99");

            // Act — same first hop ("203.0.113.5"), different trailing hop and same remote addr
            MockHttpServletResponse secondResponse = new MockHttpServletResponse();
            filter.doFilter(second, secondResponse, chain);

            // Assert — treated as the same client, so the bucket is already exhausted
            assertThat(secondResponse.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        }
    }

    @Nested
    class ShouldNotFilter {

        @Test
        void exemptsPingFromRateLimiting() {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 1), objectMapper);
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setRequestURI("/ping");

            // Act
            boolean result = ReflectionTestUtils.invokeMethod(filter, "shouldNotFilter", request);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        void exemptsActuatorEndpointsFromRateLimiting() {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 1), objectMapper);
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setRequestURI("/actuator/health");

            // Act
            boolean result = ReflectionTestUtils.invokeMethod(filter, "shouldNotFilter", request);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        void appliesRateLimitingToOrdinaryApiRoutes() {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 1), objectMapper);
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setRequestURI("/api/v1/factories/OpenAI");

            // Act
            boolean result = ReflectionTestUtils.invokeMethod(filter, "shouldNotFilter", request);

            // Assert
            assertThat(result).isFalse();
        }

        @Test
        void ping_neverConsumesABucketOrInvokesTheChainThroughDoFilterInternal() throws Exception {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 1), objectMapper);
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setRequestURI("/ping");
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = mock(FilterChain.class);

            // Act — OncePerRequestFilter.doFilter itself skips doFilterInternal when shouldNotFilter is true,
            // calling the chain directly instead
            filter.doFilter(request, response, chain);

            // Assert
            verify(chain, times(1)).doFilter(request, response);
            assertThat(response.getHeader(HeaderConstants.RATE_LIMIT_REMAINING)).isNull();
        }
    }

    @Nested
    class EvictIdleBuckets {

        @Test
        void removesBucketsIdleBeyondTheThreshold_keepsRecentlyTouchedOnes() throws Exception {
            // Arrange
            RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(true, 5), objectMapper);
            FilterChain chain = mock(FilterChain.class);

            MockHttpServletRequest idleClient = new MockHttpServletRequest();
            idleClient.setRemoteAddr("192.0.2.1");
            filter.doFilter(idleClient, new MockHttpServletResponse(), chain);

            MockHttpServletRequest activeClient = new MockHttpServletRequest();
            activeClient.setRemoteAddr("192.0.2.2");
            filter.doFilter(activeClient, new MockHttpServletResponse(), chain);

            @SuppressWarnings("unchecked")
            Map<String, Object> bucketsByClient =
                    (Map<String, Object>) ReflectionTestUtils.getField(filter, "bucketsByClient");
            Object idleTrackedBucket = bucketsByClient.get("192.0.2.1");
            ReflectionTestUtils.setField(idleTrackedBucket, "lastAccessed", Instant.now().minus(Duration.ofMinutes(11)));

            // Act
            ReflectionTestUtils.invokeMethod(filter, "evictIdleBuckets");

            // Assert
            assertThat(bucketsByClient).doesNotContainKey("192.0.2.1");
            assertThat(bucketsByClient).containsKey("192.0.2.2");
        }
    }
}
