package com.ragflow.llmgateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragflow.llmgateway.config.RateLimitProperties;
import com.ragflow.llmgateway.constants.HeaderConstants;
import com.ragflow.llmgateway.dto.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Enforces {@code llm.rate-limit.requests-per-minute} per client (identified by remote/forwarded
 * IP, in the absence of any authenticated tenant identity yet). Buckets are held in-memory per
 * instance — under horizontal scale-out each replica enforces the limit independently rather than
 * sharing a global count; move to a Redis-backed Bucket4j proxy manager if that becomes a problem.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Duration IDLE_EVICTION_THRESHOLD = Duration.ofMinutes(10);

    private final RateLimitProperties rateLimitProperties;
    private final ObjectMapper objectMapper;
    private final Map<String, TrackedBucket> bucketsByClient = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/ping") || path.startsWith("/actuator/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!rateLimitProperties.enabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientId = resolveClientId(request);
        Bucket bucket = bucketsByClient.computeIfAbsent(clientId, id -> new TrackedBucket(newBucket())).touch();

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        response.setHeader(HeaderConstants.RATE_LIMIT_REMAINING, String.valueOf(probe.getRemainingTokens()));

        if (probe.isConsumed()) {
            filterChain.doFilter(request, response);
            return;
        }

        long retryAfterSeconds = Math.max(1, probe.getNanosToWaitForRefill() / 1_000_000_000);
        log.warn("Rate limit exceeded for client {}", clientId);
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HeaderConstants.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(
                ApiResponse.error(HttpStatus.TOO_MANY_REQUESTS.value(), "Rate limit exceeded, retry later")));
    }

    /**
     * Periodically drops buckets for clients that haven't been seen recently, so long-running
     * instances don't accumulate one entry per distinct caller forever.
     */
    @Scheduled(fixedRate = 5, timeUnit = TimeUnit.MINUTES)
    void evictIdleBuckets() {
        Instant cutoff = Instant.now().minus(IDLE_EVICTION_THRESHOLD);
        bucketsByClient.values().removeIf(tracked -> tracked.lastAccessed.isBefore(cutoff));
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(rateLimitProperties.requestsPerMinute())
                .refillGreedy(rateLimitProperties.requestsPerMinute(), Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveClientId(HttpServletRequest request) {
        String forwardedFor = request.getHeader(HeaderConstants.FORWARDED_FOR);
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * A bucket plus the last time it was touched, so {@link #evictIdleBuckets()} can reclaim
     * entries for clients that have stopped calling.
     */
    @RequiredArgsConstructor
    private static final class TrackedBucket {
        private final Bucket bucket;
        private volatile Instant lastAccessed = Instant.now();

        private Bucket touch() {
            lastAccessed = Instant.now();
            return bucket;
        }
    }
}
