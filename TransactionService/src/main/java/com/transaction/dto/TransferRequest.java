package com.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for initiating a fund transfer request.
 * Uses account numbers for user-friendliness.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {
    @NotBlank(message = "From Account Number cannot be empty")
    private String fromAccountNumber; // Changed from fromAccountId

    @NotBlank(message = "To Account Number cannot be empty")
    private String toAccountNumber;   // Changed from toAccountId

    @NotNull(message = "Amount cannot be null")
    @Positive(message = "Amount must be positive")
    private Double amount;
}
