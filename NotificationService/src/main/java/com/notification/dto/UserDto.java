package com.notification.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Enums mirroring backend User.java


@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String userId;
    private String username;
    private String email; // <--- This is the crucial field
    private UserRole role;
    private LocalDateTime createdAt;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String address;
    private String phoneNumber;
    private KycStatus kycStatus;
    public enum UserRole {
        CUSTOMER,
        ADMIN,
    }
    public enum KycStatus {
        PENDING,
        VERIFIED,
        REJECTED,
    }

}
