package com.transaction.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountDto {
	 private String accountId;
	    private String userId;
	    private String accountNumber;
	    private AccountType accountType; // Changed to enum
	    private Double balance;
	    private AccountStatus status; // Changed to enum
	    private LocalDateTime createdAt;

	    // Enum definitions for AccountType
	    public enum AccountType {
	        SAVINGS,
	        CURRENT
	    }

	    // Enum definitions for AccountStatus
	    public enum AccountStatus {
	        ACTIVE,
	        CLOSED
	    }
}

