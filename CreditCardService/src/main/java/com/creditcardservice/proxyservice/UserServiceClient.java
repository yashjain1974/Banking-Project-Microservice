package com.creditcardservice.proxyservice;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.creditcardservice.dto.UserDto;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "user-service", path = "/auth")
public interface UserServiceClient {

    @GetMapping("/user/{userId}")
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserByIdFallback")
    @Retry(name = "userService")
    UserDto getUserById(@PathVariable("userId") String userId);

    default UserDto getUserByIdFallback(String userId, Throwable t) {
        System.err.println("Fallback triggered for UserService.getUserById for user " + userId + " in Card Service: " + t.getMessage());
        // For card issuance, user validation is critical. Throwing an exception is appropriate.
        throw new RuntimeException("User service unavailable or user not found via fallback for ID: " + userId, t);
    }
}