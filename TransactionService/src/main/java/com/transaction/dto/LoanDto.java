package com.transaction.dto;

import java.time.LocalDateTime; // For createdAt

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanDto {
    private String loanId;
    private String userId;
    private LoanType loanType; // Enum Possible values: HOME, PERSONAL, EDUCATION
    private Double amount;
    private Integer tenureMonths;
    private Double interestRate;
    private LoanStatus status; // Enum Possible values: APPROVED, PENDING, REJECTED
    private LocalDateTime applicationDate;

    // Enum definitions for LoanType
    public enum LoanType {
        HOME,
        PERSONAL,
        EDUCATION
    }

    // Enum definitions for LoanStatus
    public enum LoanStatus {
        APPROVED,
        PENDING,
        REJECTED
    }
}