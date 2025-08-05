package com.bank.loan.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.bank.loan.enums.LoanType;

@Entity
@Table(name = "loans")
@Data
public class Loan {

	@Id
	@Column(name = "loan_id", nullable = false, unique = true)
	private String loanId;

	@Column(name = "user_id", nullable = false)
	private String userId;

	@Enumerated(EnumType.STRING)
	@Column(name = "loan_type")
    private LoanType loanType;

	@Column(name = "amount", nullable = false)
	private BigDecimal amount;

	@Column(name = "tenure_in_months", nullable = false)
	private Integer tenureInMonths;

	@Column(name = "interest_rate", nullable = false,columnDefinition = "NUMBER(5,2)")
	private Double interestRate;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private LoanStatus status;

	@Column(name = "application_date", nullable = false)
	private LocalDateTime applicationDate;
	
	public enum LoanStatus {
	    APPROVED,
	    PENDING,
	    REJECTED
	}

}
