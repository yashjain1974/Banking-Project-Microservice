package com.userMicroservice.model;

import java.time.LocalDate; // Added for dateOfBirth
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // Marks this class as a JPA entity, mapping it to a database table named 'User' by default
@Data // Lombok: Generates getters, setters, equals, hashCode, and toString methods
@NoArgsConstructor // Lombok: Generates a no-argument constructor (required by JPA)
@AllArgsConstructor // Lombok: Generates a constructor with all fields
@Table(name = "user_table")
public class User {

    @Id // Designates 'userId' as the primary key
    // This userId will typically be the 'sub' (subject) claim from Keycloak's JWT,
    // which is Keycloak's internal unique identifier for the user.
    @Column(name = "user_id", updatable = false, nullable = false)
    private String userId;

    @Column(name = "username", unique = true, nullable = false)
    private String username; // User's chosen username (can be synced from Keycloak)

    @Column(name = "email", unique = true, nullable = false)
    private String email; // User's email address (can be synced from Keycloak)

    @Enumerated(EnumType.STRING) // Stores the enum as a string in the database
    @Column(name = "role", nullable = false)
    private UserRole role; // Primary role (e.g., CUSTOMER, ADMIN) - can be synced from Keycloak or primary role for this app

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Timestamp when the user profile was created/synced

    // --- Additional User Profile Fields ---
    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth; // Using LocalDate for date only

    @Column(name = "address")
    private String address;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING) // Stores the enum as a string in the database
    @Column(name = "kyc_status")
    private KycStatus kycStatus; // Example: PENDING, VERIFIED, REJECTED

}
