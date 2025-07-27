package com.transaction.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for sending withdrawal requests to the Account Service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawRequestDto {
	private String transactionId; // Reference to the transaction that initiated this withdrawal
	private Double amount; // The amount to be withdrawn
}