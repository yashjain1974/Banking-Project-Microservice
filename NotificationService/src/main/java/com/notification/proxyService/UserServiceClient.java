package com.notification.proxyService;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader; // Import RequestHeader

import com.notification.dto.UserDto;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "user-service", path = "/auth")
public interface UserServiceClient {

    /**
     * Retrieves user details by ID from the User Microservice.
     * This method sends a service-to-service token in the Authorization header.
     *
     * @param userId The ID of the user to retrieve.
     * @param authorizationHeader The service-to-service JWT token (e.g., "Bearer <token>").
     * @return A UserDto object containing the user details.
     */
    @GetMapping("/user/{userId}")
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserByIdFallback")
    @Retry(name = "userService")
    UserDto getUserById(@PathVariable("userId") String userId,
                        @RequestHeader("Authorization") String authorizationHeader); // Pass service-to-service token

    /**
     * Fallback method for getUserById.
     * This is called when the primary call to the User Microservice fails.
     * It returns a mock UserDto with PENDING KYC status and a fallback email,
     * ensuring that the notification process can still log the attempt, even if
     * the user's real email cannot be fetched.
     *
     * @param userId The ID of the user that was being looked up.
     * @param authorizationHeader The service-to-service token (passed to fallback for signature match).
     * @param t The Throwable that caused the fallback.
     * @return A mock UserDto with PENDING KYC status.
     */
    default UserDto getUserByIdFallback(String userId, String authorizationHeader, Throwable t) {
        System.err.println("Fallback triggered for UserService.getUserById for user " + userId + " in Notification Service: " + t.getMessage());
        return new UserDto(
                userId,
                "fallback_user",
                "yash191174@gmail.com", // Fallback email for debugging
                UserDto.UserRole.CUSTOMER,
                LocalDateTime.now(),
                "Fallback", "User", LocalDate.of(1970, 1, 1), "N/A", "N/A", UserDto.KycStatus.PENDING
        );
    }
}
