package com.bank.loan.config;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import feign.RequestInterceptor;

@Configuration
public class FeignClientConfiguration {

    /**
     * Creates a RequestInterceptor that adds the Authorization header to outgoing Feign requests.
     * This ensures that the JWT from the incoming request is forwarded to downstream microservices.
     * This bean is specifically for Feign client configuration.
     *
     * @return A RequestInterceptor bean.
     */
    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            Optional.ofNullable(attributes)
                .map(ServletRequestAttributes::getRequest)
                .map(request -> request.getHeader("Authorization"))
                .filter(authHeader -> authHeader != null && authHeader.startsWith("Bearer "))
                .ifPresent(authHeader -> {
                    requestTemplate.header("Authorization", authHeader);
                    System.out.println("Forwarding Authorization header from Loan Service Feign: " + authHeader.substring(0, Math.min(authHeader.length(), 30)) + "...");
                });
        };
    }
}
