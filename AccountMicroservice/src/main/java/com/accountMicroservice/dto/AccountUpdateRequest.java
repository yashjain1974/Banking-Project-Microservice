package com.accountMicroservice.dto;

import com.accountMicroservice.model.AccountStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating an existing account's status.
 * Used for PUT /accounts/{accountId} endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountUpdateRequest {
    @NotNull(message = "Account status cannot be null")
    private AccountStatus status; // ACTIVE, CLOSED
}