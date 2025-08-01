package com.accountMicroservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for receiving deposit requests from other microservices (e.g., Transaction Service).
 * Note: This DTO structure should match the DepositRequestDto sent by the Transaction Service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositRequest {
    @NotBlank(message = "Transaction ID cannot be empty")
    private String transactionId; // Reference to the transaction that initiated this deposit

    @NotNull(message = "Amount cannot be null")
    @Positive(message = "Amount must be positive")
    private Double amount;        // The amount to be deposited
}