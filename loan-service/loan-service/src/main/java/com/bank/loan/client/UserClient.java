package com.bank.loan.client;

import java.time.LocalDate; // For UserDto fallback
import java.time.LocalDateTime; // For UserDto fallback

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.bank.loan.dto.UserDto; // Assuming this DTO exists in com.bank.loan.dto

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker; // Import for Resilience4j
import io.github.resilience4j.retry.annotation.Retry; // Import for Resilience4j

@FeignClient(name = "user-service", path = "/auth") // 'name' matches user-service's spring.application.name
public interface UserClient {

    /**
     * Retrieves user details by ID from the User Service.
     * Corresponds to GET /auth/user/{userId}
     *
     * @param userId The ID of the user to retrieve.
     * @return A UserDto object containing the user details, or null if not found.
     */
    @GetMapping("/user/{userId}")
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserByIdFallback") // Apply Circuit Breaker
    @Retry(name = "userService") // Apply Retry logic
    UserDto getUserById(@PathVariable("userId") String userId);

    /**
     * Fallback method for getUserById.
     * This is called when the primary call to the User Service fails (e.g., due to network issues,
     * service unavailability, or circuit breaker being open).
     *
     * @param userId The ID of the user that was being looked up.
     * @param t The Throwable that caused the fallback.
     * @return A mock UserDto.
     */
    default UserDto getUserByIdFallback(String userId, Throwable t) {
        System.err.println("Fallback triggered for getUserById for user " + userId + " in Loan Service: " + t.getMessage());
        // Return a mock user. For loan application, you might want to throw an exception
        // if user validation is critical and a mock user isn't sufficient.
        return new UserDto(
                userId,
                "mockuser_" + userId,
                "mock." + userId + "@example.com",
                UserDto.UserRole.CUSTOMER, // Default role for mock user
                LocalDateTime.now(),
                "MockFirstName", // Added for consistency with UserDto constructor
                "MockLastName",  // Added for consistency with UserDto constructor
                LocalDate.of(1970, 1, 1), // Added for consistency with UserDto constructor
                "Mock Address, Mock City", // Added for consistency with UserDto constructor
                "999-999-9999",  // Added for consistency with UserDto constructor
                UserDto.KycStatus.PENDING // Added for consistency with UserDto constructor
        );
    }
}

