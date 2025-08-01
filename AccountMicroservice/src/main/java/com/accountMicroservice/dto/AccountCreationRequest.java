package com.accountMicroservice.dto;

import com.accountMicroservice.model.AccountType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new bank account.
 * Used for POST /accounts/create endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountCreationRequest {
    @NotBlank(message = "User ID cannot be empty")
    private String userId;

    @NotNull(message = "Account type cannot be null")
    private AccountType accountType; // SAVINGS, CURRENT

    @NotNull(message = "Initial balance cannot be null")
    @PositiveOrZero(message = "Initial balance must be zero or positive")
    private Double initialBalance;
}