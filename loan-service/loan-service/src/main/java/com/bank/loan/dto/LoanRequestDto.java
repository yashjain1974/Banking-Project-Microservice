package com.bank.loan.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

import com.bank.loan.enums.LoanType;

@Data
public class LoanRequestDto {

	@NotBlank(message = "User ID is required")
	private String userId;

	@NotNull(message = "Loan amount is required")
	@DecimalMin(value = "1000.00", message = "Loan amount must be at least 1000")
	private BigDecimal amount;

	@NotNull(message = "Tenure is required")
	@Min(value = 1, message = "Minimum tenure is 1 month")
	private Integer tenureInMonths;

	@NotNull(message = "Interest rate is required")
	@DecimalMin(value = "1.0", message = "Interest rate must be positive")
	private Double interestRate;

	@NotNull(message = "Loan type is required")
	private LoanType loanType;

}
