package com.accountMicroservice.proxyService;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.accountMicroservice.dto.UserDto;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "user-service", path = "/auth") // Assuming User Service is /auth
public interface UserServiceClient {

    /**
     * Retrieves user details by ID from the User Microservice.
     * Corresponds to GET /auth/user/{userId}
     *
     * @param userId The ID of the user to retrieve.
     * @return A UserDto object containing the user details.
     */
    @GetMapping("/user/{userId}")
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserProfileByIdFallback")
    @Retry(name = "userService")
    UserDto getUserProfileById(@PathVariable("userId") String userId);

    /**
     * Fallback method for getUserProfileById.
     * This is called when the primary call to the User Microservice fails.
     * It returns a mock UserDto with PENDING KYC status, which will cause the
     * KYC check in the Transaction Service to fail, preventing unauthorized transactions.
     *
     * @param userId The ID of the user that was being looked up.
     * @param t The Throwable that caused the fallback.
     * @return A mock UserDto with PENDING KYC status.
     */
    default UserDto getUserProfileByIdFallback(String userId, Throwable t) {
        System.err.println("Fallback triggered for getUserProfileById for user " + userId + " in Transaction Service: " + t.getMessage());
        // Return a mock UserDto with PENDING KYC status.
        // This ensures that if the User Service is down, the KYC check fails,
        // preventing transactions for unverified users.
        return new UserDto(
                userId,
                "mockuser_" + userId,
                "mock." + userId + "@example.com",
                UserDto.UserRole.CUSTOMER, // Default role for mock user
                LocalDateTime.now(),
                "MockFirstName",
                "MockLastName",
                LocalDate.of(1970, 1, 1),
                "Mock Address, Mock City",
                "999-999-9999",
                UserDto.KycStatus.PENDING // Crucial: Set to PENDING to deny access if User Service is down
        );
    }
}