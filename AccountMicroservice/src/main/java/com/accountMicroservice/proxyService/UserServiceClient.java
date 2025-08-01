package com.accountMicroservice.proxyService;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.accountMicroservice.dto.UserDto;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "user-service", path = "/auth") // Assuming User Service is /auth
public interface UserServiceClient {

    /**
     * Retrieves user details by ID from the User Service.
     * Corresponds to GET /auth/user/{id}
     * @param userId The ID of the user to retrieve.
     * @return A UserDto object containing the user details, or null if not found.
     */
    @GetMapping("/user/{userId}")
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserByIdFallback")
    @Retry(name = "userService")
    UserDto getUserById(@PathVariable("userId") String userId);

    /**
     * Fallback method for getUserById.
     * Returns null or throws a specific exception when User Service is unavailable.
     */
    default UserDto getUserByIdFallback(String userId, Throwable t) {
        System.err.println("Fallback triggered for getUserById for user " + userId + ": " + t.getMessage());
        // For user validation, returning null implies user not found or service unavailable.
        // You might want to throw an exception here if user validation is critical.
        return null;
    }
}