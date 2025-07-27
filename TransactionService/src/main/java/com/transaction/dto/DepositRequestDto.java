package com.transaction.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for sending deposit requests to the Account Service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositRequestDto {
    private String transactionId; // Reference to the transaction that initiated this deposit
    private Double amount;        // The amount to be deposited
}