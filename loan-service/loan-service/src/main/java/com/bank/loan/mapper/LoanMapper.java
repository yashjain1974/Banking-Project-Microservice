package com.bank.loan.mapper;

import java.time.LocalDateTime;
import java.util.UUID;

import com.bank.loan.dto.LoanRequestDto;
import com.bank.loan.dto.LoanResponseDto;
import com.bank.loan.entity.Loan;
import com.bank.loan.entity.Loan.LoanStatus;

public class LoanMapper {
	public static Loan toEntity(LoanRequestDto dto) {
		Loan loan = new Loan();
		loan.setLoanId(UUID.randomUUID().toString());
		loan.setUserId(dto.getUserId());
		loan.setLoanType(dto.getLoanType());
		loan.setAmount(dto.getAmount());
		loan.setTenureInMonths(dto.getTenureInMonths());
		loan.setInterestRate(dto.getInterestRate());
		loan.setStatus(LoanStatus.PENDING);
		loan.setApplicationDate(LocalDateTime.now());
		return loan;
	}

	public static LoanResponseDto toDto(Loan loan) {
		LoanResponseDto dto = new LoanResponseDto();
		dto.setLoanId(loan.getLoanId());
		dto.setUserId(loan.getUserId());
		dto.setLoanType(loan.getLoanType());
		dto.setAmount(loan.getAmount());
		dto.setTenureInMonths(loan.getTenureInMonths());
		dto.setInterestRate(loan.getInterestRate());
		dto.setStatus(loan.getStatus());
		dto.setApplicationDate(loan.getApplicationDate());
		return dto;
	}

}
