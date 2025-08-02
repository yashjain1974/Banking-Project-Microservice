package com.accountMicroservice.config;

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
     * This ensures that the JWT from the incoming request (from the API Gateway) is forwarded
     * to downstream microservices (like the User Service).
     *
     * @return A RequestInterceptor bean.
     */
    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            // Get current request attributes (if available, meaning it's an HTTP request context)
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            // If attributes are present, it means there's an active HTTP request
            Optional.ofNullable(attributes)
                .map(ServletRequestAttributes::getRequest)
                .map(request -> request.getHeader("Authorization")) // Get the Authorization header from the incoming request
                .filter(authHeader -> authHeader != null && authHeader.startsWith("Bearer ")) // Ensure it's a Bearer token
                .ifPresent(authHeader -> {
                    // Add the Authorization header to the outgoing Feign request
                    requestTemplate.header("Authorization", authHeader);
                    System.out.println("Forwarding Authorization header: " + authHeader.substring(0, Math.min(authHeader.length(), 30)) + "..."); // Log for debugging
                });
        };
    }
}