package com.userMicroservice.dto;

import java.time.LocalDate;

import com.userMicroservice.model.KycStatus;
import com.userMicroservice.model.UserRole;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    // Fields can be optional for updates, use @NotBlank(required=false) or remove if not strictly needed
    private String username;
    @Email(message = "Email should be a valid email address")
    private String email;
    private UserRole role;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String address;
    private String phoneNumber;
    private KycStatus kycStatus;
}