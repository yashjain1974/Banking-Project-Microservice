package com.accountMicroservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // Marks this class as a JPA entity, mapping it to a database table named 'Account' by default
@Data // Lombok: Generates getters, setters, equals, hashCode, and toString methods
@NoArgsConstructor // Lombok: Generates a no-argument constructor (required by JPA)
@AllArgsConstructor // Lombok: Generates a constructor with all fields
public class Account {

    @Id // Designates 'accountId' as the primary key
    @GeneratedValue(strategy = GenerationType.UUID) // Using UUID for robust and unique ID generation
    @Column(name = "account_id", updatable = false, nullable = false)
    private String accountId;

    @Column(name = "user_id", nullable = false)
    private String userId; // Foreign key referencing the User Service's User ID

    @Pattern(regexp = "^[0-9]+$", message = "Account number must be a positive numeric string")
    @Column(name = "account_number", unique = true, nullable = false)
    private String accountNumber; // Unique identifier for the account (e.g., 1234567890)

    @Enumerated(EnumType.STRING) // Stores the enum as a string in the database
    @Column(name = "account_type", nullable = false)
    private AccountType accountType; // Possible values: SAVINGS, CURRENT

    @Column(name = "balance", nullable = false)
    private Double balance; // Current balance of the account

    @Enumerated(EnumType.STRING) // Stores the enum as a string in the database
    @Column(name = "status", nullable = false)
    private AccountStatus status; // Possible values: ACTIVE, CLOSED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Timestamp when the account was created

}