package com.notification.config;

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
     * This ensures that the JWT from the incoming request is forwarded to downstream microservices (like User Service).
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
            .ifPresentOrElse(authHeader -> {
                requestTemplate.header("Authorization", authHeader);
                System.out.println("Forwarding Authorization header: " + authHeader.substring(0, 30) + "...");
            }, () -> {
                System.out.println("❌ No Authorization header present or request context is null. Feign will not forward token.");
            });
        };
    }
}

