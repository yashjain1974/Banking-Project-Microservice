package com.transaction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients; // Correct annotation to enable Feign clients

@SpringBootApplication
@EnableFeignClients(basePackages = "com.transaction.proxyService") // IMPORTANT: Specifies the package where your Feign client interfaces are
@EntityScan("com.transaction.model") // Scans for JPA entities
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
