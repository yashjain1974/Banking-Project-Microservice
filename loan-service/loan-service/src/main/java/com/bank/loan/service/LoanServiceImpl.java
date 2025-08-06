package com.bank.loan.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bank.loan.client.UserClient;
import com.bank.loan.dto.LoanRequestDto;
import com.bank.loan.dto.LoanResponseDto;
import com.bank.loan.dto.UserDto;
import com.bank.loan.entity.Loan;
import com.bank.loan.entity.Loan.LoanStatus;
import com.bank.loan.event.LoanStatusUpdatedEvent; // <--- Ensure this event DTO is correctly imported
import com.bank.loan.exception.LoanCreationException;
import com.bank.loan.exception.LoanNotFoundException;
import com.bank.loan.exception.LoanProcessingException;
import com.bank.loan.exception.UnauthorizedUserException;
import com.bank.loan.mapper.LoanMapper;
import com.bank.loan.repository.LoanRepository;

@Service
public class LoanServiceImpl implements LoanService {
	private final LoanRepository loanRepository;
	private final UserClient userClient;
    private final KafkaTemplate<String, LoanStatusUpdatedEvent> kafkaTemplate; // Ensure correct KafkaTemplate type

	@Autowired
	public LoanServiceImpl(LoanRepository loanRepository, UserClient userClient, KafkaTemplate<String, LoanStatusUpdatedEvent> kafkaTemplate) {
		this.loanRepository = loanRepository;
		this.userClient = userClient;
        this.kafkaTemplate = kafkaTemplate;
	}

    /**
     * Helper method for KYC check.
     */
    private void checkKycStatus(String userId) {
        UserDto userProfile = userClient.getUserById(userId);
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
			UserDto user = userClient.getUserById(requestDto.getUserId());
			if (user == null) {
				throw new LoanCreationException("User not found with ID: " + requestDto.getUserId());
			}
            checkKycStatus(requestDto.getUserId());

			Loan loan = LoanMapper.toEntity(requestDto);
			loan.setApplicationDate(LocalDateTime.now());
			loan.setStatus(LoanStatus.PENDING);

			Loan savedLoan = loanRepository.save(loan);

            // Publish Loan status updated event (for initial PENDING status)
            publishLoanStatusUpdatedEvent(
                savedLoan.getLoanId(),
                savedLoan.getUserId(),
                null, // Old status is null for new creation
                savedLoan.getStatus().name(),
                savedLoan.getAmount().doubleValue(),
                savedLoan.getLoanType().name(),
                "Your loan application has been submitted and is PENDING approval."
            );

			return LoanMapper.toDto(savedLoan);
		} catch (DataIntegrityViolationException e) {
			throw new LoanCreationException("Failed to apply for loan due to data integrity violation.", e);
		} catch (LoanCreationException | UnauthorizedUserException e) {
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
		
		String oldStatus = loan.getStatus().name(); // Store old status

		if (loan.getStatus() == LoanStatus.APPROVED) {
            throw new LoanProcessingException("Loan with ID: " + loanId + " is already approved.");
        }
        if (loan.getStatus() == LoanStatus.REJECTED) {
            throw new LoanProcessingException("Loan with ID: " + loanId + " was already rejected and cannot be approved.");
        }

		loan.setStatus(LoanStatus.APPROVED);
		try {
            Loan updatedLoan = loanRepository.save(loan);
            // Publish Loan status updated event
            publishLoanStatusUpdatedEvent(
                updatedLoan.getLoanId(),
                updatedLoan.getUserId(),
                oldStatus,
                updatedLoan.getStatus().name(),
                updatedLoan.getAmount().doubleValue(),
                updatedLoan.getLoanType().name(),
                "Your loan application has been APPROVED."
            );
            return LoanMapper.toDto(updatedLoan);
        } catch (Exception e) {
            throw new LoanProcessingException("Failed to approve loan with ID: " + loanId, e);
        }
	}

	@Override
	@Transactional
	public LoanResponseDto rejectLoan(String loanId) {
		Loan loan = loanRepository.findById(loanId)
				.orElseThrow(() -> new LoanNotFoundException("Loan not found with id: " + loanId));
		
		String oldStatus = loan.getStatus().name(); // Store old status

		if (loan.getStatus() == LoanStatus.REJECTED) {
            throw new LoanProcessingException("Loan with ID: " + loanId + " is already rejected.");
        }
        if (loan.getStatus() == LoanStatus.APPROVED) {
            throw new LoanProcessingException("Loan with ID: " + loanId + " was already approved and cannot be rejected.");
        }

		loan.setStatus(LoanStatus.REJECTED);
		try {
            Loan updatedLoan = loanRepository.save(loan);
            // Publish Loan status updated event
            publishLoanStatusUpdatedEvent(
                updatedLoan.getLoanId(),
                updatedLoan.getUserId(),
                oldStatus,
                updatedLoan.getStatus().name(),
                updatedLoan.getAmount().doubleValue(),
                updatedLoan.getLoanType().name(),
                "Your loan application has been REJECTED."
            );
            return LoanMapper.toDto(updatedLoan);
        } catch (Exception e) {
            throw new LoanProcessingException("Failed to reject loan with ID: " + loanId, e);
        }
	}

	@Override
	public Double calculateEmi(String loanId) {
		Loan loan = loanRepository.findById(loanId)
				.orElseThrow(() -> new LoanNotFoundException("Loan not found with id: " + loanId));

		double principal = loan.getAmount().doubleValue();
		double annualRate = loan.getInterestRate();
		int months = loan.getTenureInMonths();

		if (annualRate <= 0 || months <= 0) {
            throw new LoanProcessingException("Invalid loan details for EMI calculation: annual rate and months must be positive.");
        }

		double monthlyRate = annualRate / 12 / 100;
		double emi;

		if (monthlyRate == 0) {
            emi = principal / months;
        } else {
            emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months))
                    / (Math.pow(1 + monthlyRate, months) - 1);
        }
		
		return Math.round(emi * 100.0) / 100.0;
	}

	@Override
	public List<LoanResponseDto> getAllLoans() {
		List<Loan> loans = loanRepository.findAll();
		return loans.stream().map(LoanMapper::toDto).collect(Collectors.toList());
	}

    /**
     * Helper method to publish LoanStatusUpdatedEvent to Kafka.
     */
    private void publishLoanStatusUpdatedEvent(String loanId, String userId, String oldStatus, String newStatus, Double loanAmount, String loanType, String message) {
        LoanStatusUpdatedEvent event = new LoanStatusUpdatedEvent(
            loanId,
            userId,
            oldStatus,
            newStatus,
            loanAmount,
            loanType,
            LocalDateTime.now(),
            message
        );
        try {
            kafkaTemplate.send("loan-status-events", event); // 'loan-status-events' is the Kafka topic name
            System.out.println("Published loan status updated event to Kafka: Loan " + loanId + ", Status: " + newStatus);
        } catch (Exception e) {
            System.err.println("Failed to publish loan status updated event to Kafka for loan " + loanId + ": " + e.getMessage());
        }
    }
}
