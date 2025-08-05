package com.bank.AccountService.dto;

import com.bank.AccountService.entity.AccountStatus;
import com.bank.AccountService.entity.AccountType;
import lombok.*;

@Data
@Builder
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private String userId;
    private String email;
    private String phone;
    private AccountType type;
    private AccountStatus status;
    private Double balance;
}