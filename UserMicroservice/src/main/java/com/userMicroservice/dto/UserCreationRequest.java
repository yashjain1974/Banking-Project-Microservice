package com.userMicroservice.dto;

import java.time.LocalDate;

import com.userMicroservice.model.KycStatus;
import com.userMicroservice.model.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size; // For password length validation
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new user profile.
 * This is the payload received when a new user profile is to be created or synced.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreationRequest {
    // userId is typically provided by Keycloak after initial registration/login,
    // so it might not be part of the *initial* creation request from a frontend,
    // but rather set internally or in a sync process.
    // For direct API creation, you might include it if it's pre-assigned.
    // For simplicity here, we assume it's either generated or provided.
    private String userId; // Can be null if generated internally by Keycloak

    @NotBlank(message = "Username cannot be empty")
    private String username;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, message = "Password must be at least 8 characters long") // Example password policy
    private String password; // <--- ADDED: Password field for Keycloak registration

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email should be a valid email address")
    private String email;

    @NotNull(message = "Role cannot be null")
    private UserRole role; // Default to CUSTOMER

    // Additional profile fields
    @NotBlank(message = "First name cannot be empty")
    private String firstName;

    @NotBlank(message = "Last name cannot be empty")
    private String lastName;

    @NotNull(message = "Date of birth cannot be null")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Address cannot be empty")
    private String address;

    @NotBlank(message = "Phone number cannot be empty")
    private String phoneNumber;

    @NotNull(message = "KYC status cannot be null")
    private KycStatus kycStatus; // Default to PENDING
}