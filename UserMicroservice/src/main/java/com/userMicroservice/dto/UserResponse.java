package com.userMicroservice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.userMicroservice.model.KycStatus;
import com.userMicroservice.model.UserRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sending user profile details as a response.
 * This is the public representation of a User profile.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String userId;
    private String username;
    private String email;
    private UserRole role;
    private LocalDateTime createdAt;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String address;
    private String phoneNumber;
    private KycStatus kycStatus;
}