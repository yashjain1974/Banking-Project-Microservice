package com.userMicroservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.userMicroservice.model") // Scans for JPA entities
@EnableDiscoveryClient // Enables service registration and discovery with Eureka
@EnableJpaRepositories("com.userMicroservice.dao") // IMPORTANT: Scans for your NotificationRepository
public class UserMicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserMicroserviceApplication.class, args);
	}

}
