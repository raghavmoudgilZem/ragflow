package com.ragflow.retrieval;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
@ConfigurationPropertiesScan
public class RetreivalServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(RetreivalServiceApplication.class, args);
	}

}
