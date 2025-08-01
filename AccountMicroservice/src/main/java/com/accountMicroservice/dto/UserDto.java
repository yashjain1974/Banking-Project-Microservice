package com.accountMicroservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a User from the User/Authentication Service.
 * Used by Account Service to validate user existence.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String userId;
    private String username;
    private String email;
    private String role; // Possible values: CUSTOMER, ADMIN
    private LocalDateTime createdAt;
    // Password is intentionally omitted for security
}