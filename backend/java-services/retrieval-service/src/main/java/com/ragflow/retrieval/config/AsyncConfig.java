package com.ragflow.retrieval.config;

import com.ragflow.retrieval.exception.FeedbackAsyncExceptionHandler;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Value("${feedback.executor.core-pool-size:10}")
    private int corePoolSize;

    @Value("${feedback.executor.max-pool-size:50}")
    private int maxPoolSize;

    @Value("${feedback.executor.queue-capacity:500}")
    private int queueCapacity;

    @Value("${feedback.executor.keep-alive-seconds:60}")
    private int keepAliveSeconds;

    @Value("${feedback.executor.await-termination-seconds:30}")
    private int awaitTerminationSeconds;

    @Bean(name = "feedbackTaskExecutor")
    public ThreadPoolTaskExecutor feedbackTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setKeepAliveSeconds(keepAliveSeconds);
        executor.setThreadNamePrefix("feedback-async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(awaitTerminationSeconds);
        executor.initialize();
        return executor;
    }

    @Override
    public Executor getAsyncExecutor() {
        return feedbackTaskExecutor();
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new FeedbackAsyncExceptionHandler();
    }
}