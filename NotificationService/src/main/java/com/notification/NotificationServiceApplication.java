package com.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
//@EnableFeignClients(basePackages = "com.transaction.proxyService") // IMPORTANT: Specifies the package where your Feign client interfaces are
@EntityScan("com.notification.model") // Scans for JPA entities
@EnableJpaRepositories("com.notification.dao") // IMPORTANT: Scans for your NotificationRepository
@EnableDiscoveryClient // Enables service registration and discovery with Eureka
@EnableFeignClients(basePackages = "com.notification.proxyService")
public class NotificationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(NotificationServiceApplication.class, args);
	}

}
