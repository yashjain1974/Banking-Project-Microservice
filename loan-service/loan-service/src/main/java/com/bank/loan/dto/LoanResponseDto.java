package com.bank.loan.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.bank.loan.enums.LoanType;

@Data
public class LoanResponseDto {
	private String loanId;
	private String userId;
	private LoanType loanType;
	private BigDecimal amount;
	private Integer tenureInMonths;
	private Double interestRate;
	private String status;
	private LocalDate applicationDate;
}
