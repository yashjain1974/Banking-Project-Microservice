package com.bank.loan.service;

import com.bank.loan.dto.LoanRequestDto;
import com.bank.loan.dto.LoanResponseDto;
import java.util.*;

public interface LoanService {
	LoanResponseDto applyForLoan(LoanRequestDto requestDto);

	LoanResponseDto getLoanById(String loanId);

	List<LoanResponseDto> getAllLoans();

	List<LoanResponseDto> getLoansByUser(String userId);

	LoanResponseDto approveLoan(String loanId);

	LoanResponseDto rejectLoan(String loanId);

	Double calculateEmi(String loanId);

}
