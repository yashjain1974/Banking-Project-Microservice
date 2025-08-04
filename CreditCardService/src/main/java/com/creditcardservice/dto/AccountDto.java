package com.creditcardservice.dto;

import java.time.LocalDateTime;

import com.creditcardservice.model.AccountStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Enums mirroring backend Account.java
enum AccountType {
    SAVINGS,
    CURRENT,
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountDto {
    private String accountId;
    private String userId;
    private String accountNumber;
    private AccountType accountType;
    private Double balance;
    private AccountStatus status;
    private LocalDateTime createdAt;
}