package com.accountMicroservice.dto;

import java.time.LocalDateTime;

import com.accountMicroservice.model.AccountStatus;
import com.accountMicroservice.model.AccountType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sending account details as a response.
 * This is the public representation of an Account.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private String accountId;
    private String userId;
    private String accountNumber;
    private AccountType accountType;
    private Double balance;
    private AccountStatus status;
    private LocalDateTime createdAt;
}