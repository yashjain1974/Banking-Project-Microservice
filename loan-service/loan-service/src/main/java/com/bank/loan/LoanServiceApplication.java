package com.bank.loan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableFeignClients
@EntityScan("com.bank.loan.entity") // Scans for JPA entities
@EnableJpaRepositories("com.bank.loan.repository") // IMPORTANT: Scans for your NotificationRepository
@EnableMethodSecurity(prePostEnabled = true)
public class LoanServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LoanServiceApplication.class, args);
	}

}
