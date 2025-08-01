package com.accountMicroservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.accountMicroservice.proxyService") // IMPORTANT: Specifies the package where your Feign client interfaces are
@EntityScan("com.accountMicroservice.model") // Scans for JPA entities
@EnableJpaRepositories("com.accountMicroservice.dao") // IMPORTANT: Scans for your NotificationRepository
@EnableDiscoveryClient // Enables service registration and discovery with Eureka
public class AccountMicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AccountMicroserviceApplication.class, args);
	}

}
