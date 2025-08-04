package com.transaction.dto;

import java.time.LocalDate; // Import LocalDate for dateOfBirth
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a User from the User Microservice.
 * Used by Account Service to validate user existence and retrieve profile details.
 * This should mirror the UserResponse DTO from the User Microservice.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String userId;
    private String username;
    private String email;
    private UserRole role; // Possible values: CUSTOMER, ADMIN
    private LocalDateTime createdAt;
    // Password is intentionally omitted for security

    // --- Additional User Profile Fields (mirroring User Microservice's User entity) ---
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String address;
    private String phoneNumber;
    private KycStatus kycStatus; // <--- ADDED: KycStatus field

    // Enum for UserRole (mirroring User Microservice's User.UserRole)
    public enum UserRole {
        CUSTOMER,
        ADMIN
    }

    // Enum for KycStatus (mirroring User Microservice's User.KycStatus)
    public enum KycStatus {
        PENDING,
        VERIFIED,
        REJECTED
    }
}