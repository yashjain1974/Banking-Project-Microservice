package com.bank.loan.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bank.loan.client.UserClient;
import com.bank.loan.dto.LoanRequestDto;
import com.bank.loan.dto.LoanResponseDto;
import com.bank.loan.dto.UserDto; // Import UserDto
import com.bank.loan.entity.Loan;
import com.bank.loan.entity.Loan.LoanStatus;
import com.bank.loan.exception.LoanCreationException;
import com.bank.loan.exception.LoanNotFoundException;
import com.bank.loan.exception.LoanProcessingException;
import com.bank.loan.exception.UnauthorizedUserException; // NEW: Custom exception for KYC/unauthorized
import com.bank.loan.mapper.LoanMapper;
import com.bank.loan.repository.LoanRepository;

@Service
public class LoanServiceImpl implements LoanService {
	private final LoanRepository loanRepository;
	private final UserClient userClient; // Inject UserClient

	@Autowired
	public LoanServiceImpl(LoanRepository loanRepository, UserClient userClient) {
		this.loanRepository = loanRepository;
		this.userClient = userClient;
	}

    /**
     * Helper method for KYC check.
     */
    private void checkKycStatus(String userId) {
        UserDto userProfile = userClient.getUserById(userId); // Call UserClient
        if (userProfile == null) {
            throw new UnauthorizedUserException("User profile not found for loan application. Cannot proceed.");
        }
        if (userProfile.getKycStatus() != UserDto.KycStatus.VERIFIED) {
            throw new UnauthorizedUserException("Loan application denied: User KYC status is " + userProfile.getKycStatus() + ". Must be VERIFIED.");
        }
    }

	@Override
	@Transactional
	public LoanResponseDto applyForLoan(LoanRequestDto requestDto) {
		try {
			// 1. Validate User existence and KYC status via User Service
			UserDto user = userClient.getUserById(requestDto.getUserId()); // Call UserClient
			if (user == null) {
				throw new LoanCreationException("User not found with ID: " + requestDto.getUserId());
			}
            // Perform KYC check for the user
            checkKycStatus(requestDto.getUserId()); // <--- KYC CHECK

			Loan loan = LoanMapper.toEntity(requestDto);
			loan.setApplicationDate(LocalDateTime.now());
			loan.setStatus(LoanStatus.PENDING);

			Loan savedLoan = loanRepository.save(loan);
			return LoanMapper.toDto(savedLoan);
		} catch (DataIntegrityViolationException e) {
			throw new LoanCreationException("Failed to apply for loan due to data integrity violation.", e);
		} catch (LoanCreationException | UnauthorizedUserException e) { // Catch new exception
            throw e;
        } catch (Exception e) {
			throw new LoanProcessingException("Failed to apply for loan unexpectedly: " + e.getMessage(), e);
		}
	}

	@Override
	public LoanResponseDto getLoanById(String loanId) {
		Loan loan = loanRepository.findById(loanId)
				.orElseThrow(() -> new LoanNotFoundException("Loan not found with ID: " + loanId));
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
	@Transactional
	public LoanResponseDto approveLoan(String loanId) {
		Loan loan = loanRepository.findById(loanId)
				.orElseThrow(() -> new LoanNotFoundException("Loan not found with id: " + loanId));
		
		if (loan.getStatus() == LoanStatus.APPROVED) {
            throw new LoanProcessingException("Loan with ID: " + loanId + " is already approved.");
        }
        if (loan.getStatus() == LoanStatus.REJECTED) {
            throw new LoanProcessingException("Loan with ID: " + loanId + " was already rejected and cannot be approved.");
        }

		loan.setStatus(LoanStatus.APPROVED);
		try {
            return LoanMapper.toDto(loanRepository.save(loan));
        } catch (Exception e) {
            throw new LoanProcessingException("Failed to approve loan with ID: " + loanId, e);
        }
	}

	@Override
	@Transactional
	public LoanResponseDto rejectLoan(String loanId) {
		Loan loan = loanRepository.findById(loanId)
				.orElseThrow(() -> new LoanNotFoundException("Loan not found with id: " + loanId));
		
		if (loan.getStatus() == LoanStatus.REJECTED) {
            throw new LoanProcessingException("Loan with ID: " + loanId + " is already rejected.");
        }
        if (loan.getStatus() == LoanStatus.APPROVED) {
            throw new LoanProcessingException("Loan with ID: " + loanId + " was already approved and cannot be rejected.");
        }

		loan.setStatus(LoanStatus.REJECTED);
		try {
            return LoanMapper.toDto(loanRepository.save(loan));
        } catch (Exception e) {
            throw new LoanProcessingException("Failed to reject loan with ID: " + loanId, e);
        }
	}

	@Override
	public Double calculateEmi(String loanId) {
	    Loan loan = loanRepository.findById(loanId)
	            .orElseThrow(() -> new LoanNotFoundException("Loan not found with id: " + loanId));

	    BigDecimal principal = loan.getAmount(); // BigDecimal
	    double annualRate = loan.getInterestRate(); // still a double
	    int months = loan.getTenureInMonths();

	    if (annualRate <= 0 || months <= 0) {
	        throw new LoanProcessingException("Invalid loan details for EMI calculation: annual rate and months must be positive.");
	    }

	    BigDecimal monthlyRate = BigDecimal.valueOf(annualRate).divide(BigDecimal.valueOf(12 * 100), 10, RoundingMode.HALF_EVEN);
	    BigDecimal emi;

	    if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {
	        emi = principal.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_EVEN);
	    } else {
	        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
	        BigDecimal power = onePlusR.pow(months);
	        BigDecimal numerator = principal.multiply(monthlyRate).multiply(power);
	        BigDecimal denominator = power.subtract(BigDecimal.ONE);
	        emi = numerator.divide(denominator, 10, RoundingMode.HALF_EVEN);
	        emi = emi.setScale(2, RoundingMode.HALF_EVEN); // round to 2 decimal places
	    }

	    return emi.doubleValue(); // returning Double as per method signature
	}
	@Override
	public List<LoanResponseDto> getAllLoans() {
		List<Loan> loans = loanRepository.findAll();
		return loans.stream().map(LoanMapper::toDto).collect(Collectors.toList());
	}
}
