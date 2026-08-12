package com.ragflow.retrieval.observability;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.tracing.Tracer;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.concurrent.TimeUnit;

@Aspect
@Component
@Slf4j
public class SearchObservabilityAspect {
    private final Counter requestCounter;
    private final Counter emptyResultCounter;
    private final Timer latencyTimer;

    public SearchObservabilityAspect(MeterRegistry meterRegistry) {

        this.requestCounter = Counter.builder("search.requests.count")
                .description("Total number of search requests executed")
                .register(meterRegistry);

        this.emptyResultCounter = Counter.builder("search.results.empty")
                .description("Total number of search requests returning 0 results")
                .register(meterRegistry);

        this.latencyTimer = Timer.builder("search.latency")
                .description("Latency distribution of the RAG search operations")
                .register(meterRegistry);
    }

    @Around("execution(* com.ragflow.retrieval.service.SearchCacheFacadeService.search(..))")
    public Object monitorSearchPerformance(ProceedingJoinPoint joinPoint) throws Throwable {

        long startTime = System.nanoTime();
        Object output = null;

        try {
            safelyIncrementCounter(requestCounter);
            log.info("Search Executed"); // Triggers JSON payload with tenant_id & trace_id mapped inside MDC

            output = joinPoint.proceed();

            if (output instanceof Collection && ((Collection<?>) output).isEmpty()) {
                safelyIncrementCounter(emptyResultCounter);
            }

            return output;

        } catch (Throwable error) {
            log.error("Error Occurred", error);
            throw error;
        } finally {
            long duration = System.nanoTime() - startTime;
            safelyRecordTimer(latencyTimer, duration);
        }
    }

    private void safelyIncrementCounter(Counter counter) {
        try { counter.increment(); } catch (Exception ignored) {}
    }

    private void safelyRecordTimer(Timer timer, long duration) {
        try { timer.record(duration, TimeUnit.NANOSECONDS); } catch (Exception ignored) {}
    }
}