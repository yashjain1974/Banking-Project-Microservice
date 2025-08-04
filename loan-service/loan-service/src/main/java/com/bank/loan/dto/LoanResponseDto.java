package com.bank.loan.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.bank.loan.entity.Loan.LoanStatus;
import com.bank.loan.enums.LoanType;

@Data
public class LoanResponseDto {
	private String loanId;
	private String userId;
	private LoanType loanType;
	private BigDecimal amount;
	private Integer tenureInMonths;
	private Double interestRate;
	private LoanStatus status;
	private LocalDateTime applicationDate;
}
