package com.bank.loan.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired; // Added for @Autowired
import org.springframework.http.HttpStatus; // Added for specific HTTP status codes
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For method-level security
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bank.loan.dto.LoanRequestDto;
import com.bank.loan.dto.LoanResponseDto;
import com.bank.loan.service.LoanService;

import jakarta.validation.Valid; // For input validation

@RestController
@RequestMapping("/loans")
public class LoanController {

	private final LoanService loanService;

	@Autowired // Use constructor injection for dependencies
	public LoanController(LoanService loanService) {
		this.loanService = loanService;
	}

	/**
	 * Handles POST /loans/apply requests.
	 * Allows a user to apply for a new loan.
	 * @param loanRequestDto The DTO containing loan application details.
	 * @return ResponseEntity with the created LoanResponseDto and HTTP status 201 (Created).
	 */
	@PostMapping("/apply")
//	@PreAuthorize("isAuthenticated() and hasRole('CUSTOMER')") // Only authenticated CUSTOMERs can apply for loans
	public ResponseEntity<LoanResponseDto> applyForLoan(@Valid @RequestBody LoanRequestDto loanRequestDto) {
		LoanResponseDto responseDto = loanService.applyForLoan(loanRequestDto);
		return new ResponseEntity<>(responseDto, HttpStatus.CREATED); // Return 201 Created
	}

	/**
	 * Handles GET /loans/{loanId} requests.
	 * Retrieves details of a specific loan by its ID.
	 * @param loanId The ID of the loan.
	 * @return ResponseEntity with the LoanResponseDto and HTTP status 200 (OK).
	 */
	@GetMapping("/{loanId}")
//	@PreAuthorize("isAuthenticated() and (hasRole('ADMIN') or @loanService.getLoanById(#loanId).get().getUserId() == authentication.principal.subject)")
	// ADMINs can view any loan; CUSTOMERs can view their own loans.
	public ResponseEntity<LoanResponseDto> getLoanById(@PathVariable String loanId) {
		LoanResponseDto loan = loanService.getLoanById(loanId);
		return ResponseEntity.ok(loan);
	}

	/**
	 * Handles GET /loans/user/{userId} requests.
	 * Retrieves all loans associated with a specific user.
	 * @param userId The ID of the user.
	 * @return ResponseEntity with a list of LoanResponseDto and HTTP status 200 (OK).
	 */
	@GetMapping("/user/{userId}")
//	@PreAuthorize("isAuthenticated() and (hasRole('ADMIN') or #userId == authentication.principal.subject)")
	// ADMINs can view any user's loans; CUSTOMERs can view their own loans.
	public ResponseEntity<List<LoanResponseDto>> getLoansByUser(@PathVariable String userId) {
		List<LoanResponseDto> loans = loanService.getLoansByUser(userId);
		if (loans.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Return 204 No Content if no loans found
		}
		return ResponseEntity.ok(loans);
	}

	/**
	 * Handles GET /loans requests.
	 * Retrieves all loan applications. (Typically for administrative purposes).
	 * @return ResponseEntity with a list of LoanResponseDto and HTTP status 200 (OK).
	 */
	@GetMapping
//	@PreAuthorize("hasRole('ADMIN')") // Only ADMINs can view all loans
	public ResponseEntity<List<LoanResponseDto>> getAllLoans() {
		List<LoanResponseDto> loans = loanService.getAllLoans();
		if (loans.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		}
		return ResponseEntity.ok(loans);
	}

	/**
	 * Handles PUT /loans/{loanId}/approve requests.
	 * Approves a specific loan application. (Administrative function).
	 * @param loanId The ID of the loan to approve.
	 * @return ResponseEntity with the updated LoanResponseDto and HTTP status 200 (OK).
	 */
	@PutMapping("/{loanId}/approve")
//	@PreAuthorize("hasRole('ADMIN')") // Only ADMINs can approve loans
	public ResponseEntity<LoanResponseDto> approveLoan(@PathVariable String loanId) {
		
		return ResponseEntity.ok(loanService.approveLoan(loanId));
	}

	/**
	 * Handles PUT /loans/{loanId}/reject requests.
	 * Rejects a specific loan application. (Administrative function).
	 * @param loanId The ID of the loan to reject.
	 * @return ResponseEntity with the updated LoanResponseDto and HTTP status 200 (OK).
	 */
	@PutMapping("/{loanId}/reject")
//	@PreAuthorize("hasRole('ADMIN')") // Only ADMINs can reject loans
	public ResponseEntity<LoanResponseDto> rejectLoan(@PathVariable String loanId) {
		return ResponseEntity.ok(loanService.rejectLoan(loanId));
	}

	/**
	 * Handles GET /loans/{loanId}/emi requests.
	 * Calculates the EMI for a specific loan.
	 * @param loanId The ID of the loan.
	 * @return ResponseEntity with the calculated EMI and HTTP status 200 (OK).
	 */
	@GetMapping("/{loanId}/emi")
//	@PreAuthorize("isAuthenticated() and (hasRole('ADMIN') or @loanService.getLoanById(#loanId).get().getUserId() == authentication.principal.subject)")
	// ADMINs can calculate EMI for any loan; CUSTOMERs can calculate EMI for their own loans.
	public ResponseEntity<Double> calculateEmi(@PathVariable String loanId) {
		return ResponseEntity.ok(loanService.calculateEmi(loanId));
	}
}

