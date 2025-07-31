package com.bank.loan.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.bank.loan.dto.LoanRequestDto;
import com.bank.loan.dto.LoanResponseDto;
import com.bank.loan.entity.Loan;
import com.bank.loan.exception.LoanNotFoundException;
import com.bank.loan.mapper.LoanMapper;
import com.bank.loan.repository.LoanRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class LoanServiceImpl implements LoanService {
	private final LoanRepository loanRepository;

	public LoanServiceImpl(LoanRepository loanRepository) {
		this.loanRepository = loanRepository;
	}

	@Override
	public LoanResponseDto applyForLoan(LoanRequestDto requestDto) {
		Loan loan = LoanMapper.toEntity(requestDto);
		Loan savedLoan = loanRepository.save(loan);
		return LoanMapper.toDto(savedLoan);
	}

	@Override
	public LoanResponseDto getLoanById(String loanId) {
		Loan loan = loanRepository.findById(loanId)
				.orElseThrow(() -> new EntityNotFoundException("Loan not found with ID: " + loanId));
		return LoanMapper.toDto(loan);
	}

	@Override
	public List<LoanResponseDto> getLoansByUser(String userId) {
		List<Loan> loans = loanRepository.findByUserId(userId);
		if (loans.isEmpty()) {
			throw new LoanNotFoundException("No loans found for user: " + userId);
		}
		return loans.stream().map(LoanMapper::toDto).collect(Collectors.toList());
	}

	@Override
	public LoanResponseDto approveLoan(String loanId) {
		Loan loan = loanRepository.findById(loanId)
				.orElseThrow(() -> new LoanNotFoundException("Loan not found with id: " + loanId));
		loan.setStatus("APPROVED");
		return LoanMapper.toDto(loanRepository.save(loan));
	}

	@Override
	public LoanResponseDto rejectLoan(String loanId) {
		Loan loan = loanRepository.findById(loanId)
				.orElseThrow(() -> new LoanNotFoundException("Loan not found with id: " + loanId));
		loan.setStatus("REJECTED");
		return LoanMapper.toDto(loanRepository.save(loan));
	}

	@Override
	public Double calculateEmi(String loanId) {
		Loan loan = loanRepository.findById(loanId)
				.orElseThrow(() -> new LoanNotFoundException("Loan not found with id: " + loanId));

		double principal = loan.getAmount().doubleValue();
		double annualRate = loan.getInterestRate();
		int months = loan.getTenureInMonths();

		double monthlyRate = annualRate / 12 / 100;
		double emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months))
				/ (Math.pow(1 + monthlyRate, months) - 1);

		return Math.round(emi * 100.0) / 100.0; // rounded to 2 decimal places
	}

	@Override
	public List<LoanResponseDto> getAllLoans() {
		List<Loan> loans = loanRepository.findAll();
		return loans.stream().map(LoanMapper::toDto).collect(Collectors.toList());
	}
}
