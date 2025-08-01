package com.bank.loan.controller;

import com.bank.loan.dto.LoanRequestDto;
import com.bank.loan.dto.LoanResponseDto;
import com.bank.loan.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loans")
public class LoanController {

	private final LoanService loanService;

	public LoanController(LoanService loanService) {
		this.loanService = loanService;
	}

	@PostMapping("/apply")
	public ResponseEntity<LoanResponseDto> applyForLoan(@Valid @RequestBody LoanRequestDto loanRequestDto) {
		LoanResponseDto responseDto = loanService.applyForLoan(loanRequestDto);
		return ResponseEntity.ok(responseDto);
	}

	@GetMapping("/{loanId}")
	public ResponseEntity<LoanResponseDto> getLoanById(@PathVariable String loanId) {
		LoanResponseDto loan = loanService.getLoanById(loanId);
		return ResponseEntity.ok(loan);
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<LoanResponseDto>> getLoansByUser(@PathVariable String userId) {
		List<LoanResponseDto> loans = loanService.getLoansByUser(userId);
		return ResponseEntity.ok(loans);
	}

	@GetMapping
	public ResponseEntity<List<LoanResponseDto>> getAllLoans() {
		List<LoanResponseDto> loans = loanService.getAllLoans();
		return ResponseEntity.ok(loans);
	}

	@PutMapping("/{loanId}/approve")
	public ResponseEntity<LoanResponseDto> approveLoan(@PathVariable String loanId) {
		return ResponseEntity.ok(loanService.approveLoan(loanId));
	}

	@PutMapping("/{loanId}/reject")
	public ResponseEntity<LoanResponseDto> rejectLoan(@PathVariable String loanId) {
		return ResponseEntity.ok(loanService.rejectLoan(loanId));
	}

	@GetMapping("/{loanId}/emi")
	public ResponseEntity<Double> calculateEmi(@PathVariable String loanId) {
		return ResponseEntity.ok(loanService.calculateEmi(loanId));
	}
}
