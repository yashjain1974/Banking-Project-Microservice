package com.transaction.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import com.transaction.dao.TransactionRepository;
import com.transaction.dto.AccountDto;
import com.transaction.dto.DepositRequest;
import com.transaction.dto.DepositRequestDto;
import com.transaction.dto.NotificationRequestDto;
import com.transaction.dto.TransferRequest;
import com.transaction.dto.WithdrawRequest;
import com.transaction.dto.WithdrawRequestDto;
import com.transaction.exceptions.AccountNotFoundException;
import com.transaction.exceptions.InsufficientFundsException;
import com.transaction.exceptions.InvalidTransactionException;
import com.transaction.exceptions.TransactionProcessingException;
import com.transaction.model.Transaction;
import com.transaction.model.TransactionStatus;
import com.transaction.model.TransactionType;
import com.transaction.proxyService.AccountServiceClient;
import com.transaction.proxyService.NotificationServiceClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@Service
public class TransactionServiceImpl implements TransactionService {

	private final TransactionRepository transactionRepository;
	private final AccountServiceClient accountServiceClient;
	private final NotificationServiceClient notificationServiceClient;

	@Autowired
	public TransactionServiceImpl(TransactionRepository transactionRepository,
			AccountServiceClient accountServiceClient, NotificationServiceClient notificationServiceClient) {
		this.transactionRepository = transactionRepository;
		this.accountServiceClient = accountServiceClient;
		this.notificationServiceClient = notificationServiceClient;
	}

	@Transactional
	@CircuitBreaker(name = "transactionProcessing", fallbackMethod = "processTransactionFallback") // Example for a very broad circuit breaker
	public Transaction deposit(DepositRequest request) {
		Transaction transaction = new Transaction();
		transaction.setFromAccountId(null);
		transaction.setToAccountId(request.getAccountId());
		transaction.setAmount(request.getAmount());
		transaction.setType(TransactionType.DEPOSIT);
		transaction.setStatus(TransactionStatus.PENDING);
		transaction.setTransactionDate(LocalDateTime.now());
		transaction = transactionRepository.save(transaction); // Save to get the generated transactionId

		try {
			// Verify Account existence and perform deposit via Feign Client
			AccountDto targetAccount = accountServiceClient.getAccountById(request.getAccountId());
			if (targetAccount == null) {
				throw new AccountNotFoundException("Target account not found with ID: " + request.getAccountId());
			}

			// Call Account Service to deposit funds
			DepositRequestDto depositRequestDto = new DepositRequestDto(transaction.getTransactionId(),
					request.getAmount());
			accountServiceClient.depositFunds(request.getAccountId(), depositRequestDto);

			// Update Transaction status to SUCCESS
			transaction.setStatus(TransactionStatus.SUCCESS);
			transaction = transactionRepository.save(transaction); // Update transaction status

			// Send Notification (asynchronously, best effort)
			sendNotification(targetAccount.getUserId(), "Deposit Alert",
					"A deposit of " + request.getAmount() + " has been made to your account "
							+ targetAccount.getAccountNumber() + ". Transaction ID: " + transaction.getTransactionId(),
					NotificationRequestDto.NotificationType.EMAIL);

		} catch (HttpClientErrorException e) {
			// Handle HTTP errors from Feign client (e.g., 404 Not Found, 400 Bad Request)
			transaction.setStatus(TransactionStatus.FAILED);
			transactionRepository.save(transaction); // Update transaction status to FAILED
			throw new TransactionProcessingException(
					"Deposit failed due to Account Service error: " + e.getResponseBodyAsString(), e);
		} catch (AccountNotFoundException e) {
			// Re-throw specific exception, it will be caught by GlobalExceptionHandler
			transaction.setStatus(TransactionStatus.FAILED);
			transactionRepository.save(transaction);
			throw e;
		} catch (Exception e) {
			// Catch any other unexpected exceptions
			transaction.setStatus(TransactionStatus.FAILED);
			transactionRepository.save(transaction);
			throw new TransactionProcessingException("Deposit failed unexpectedly: " + e.getMessage(), e);
		}
		return transaction;
	}

//	 public Transaction processTransactionFallback(DepositRequest request, Throwable t) {
//	        System.err.println("Global transaction fallback for deposit: " + t.getMessage());
//	        // Log the failure, perhaps record it in a separate audit log,
//	        // and then re-throw a generic TransactionProcessingException
//	        throw new TransactionProcessingException("Transaction processing failed due to system overload or external dependency issue.", t);
//	    }
	 
	@Transactional
	public Transaction withdraw(WithdrawRequest request) {
		Transaction transaction = new Transaction();
		transaction.setFromAccountId(request.getAccountId());
		transaction.setToAccountId(null);
		transaction.setAmount(request.getAmount());
		transaction.setType(TransactionType.WITHDRAW);
		transaction.setStatus(TransactionStatus.PENDING);
		transaction.setTransactionDate(LocalDateTime.now());
		transaction = transactionRepository.save(transaction);

		try {
			// Verify Account existence and perform withdrawal via Feign Client
			AccountDto sourceAccount = accountServiceClient.getAccountById(request.getAccountId());
			if (sourceAccount == null) {
				throw new AccountNotFoundException("Source account not found with ID: " + request.getAccountId());
			}
			// Note: Balance check here is optimistic. The Account Service should be the
			// ultimate authority.
			// If the Account Service's withdraw endpoint handles insufficient funds, this
			// check might be redundant
			// or serve as an early validation.
			if (sourceAccount.getBalance() < request.getAmount()) {
				throw new InsufficientFundsException("Insufficient funds in account: " + request.getAccountId());
			}

			// Call Account Service to withdraw funds
			WithdrawRequestDto withdrawRequestDto = new WithdrawRequestDto(transaction.getTransactionId(),
					request.getAmount());
			accountServiceClient.withdrawFunds(request.getAccountId(), withdrawRequestDto);

			// Update Transaction status to SUCCESS
			transaction.setStatus(TransactionStatus.SUCCESS);
			transaction = transactionRepository.save(transaction);

			// Send Notification (asynchronously, best effort)
			sendNotification(sourceAccount.getUserId(), "Withdrawal Alert",
					"A withdrawal of " + request.getAmount() + " has been made from your account "
							+ sourceAccount.getAccountNumber() + ". Transaction ID: " + transaction.getTransactionId(),
					NotificationRequestDto.NotificationType.EMAIL);

		} catch (HttpClientErrorException e) {
			transaction.setStatus(TransactionStatus.FAILED);
			transactionRepository.save(transaction);
			throw new TransactionProcessingException(
					"Withdrawal failed due to Account Service error: " + e.getResponseBodyAsString(), e);
		} catch (AccountNotFoundException | InsufficientFundsException e) {
			// Re-throw specific exceptions
			transaction.setStatus(TransactionStatus.FAILED);
			transactionRepository.save(transaction);
			throw e;
		} catch (Exception e) {
			transaction.setStatus(TransactionStatus.FAILED);
			transactionRepository.save(transaction);
			throw new TransactionProcessingException("Withdrawal failed unexpectedly: " + e.getMessage(), e);
		}
		return transaction;
	}

	@Transactional
	public Transaction transfer(TransferRequest request) {
		Transaction transaction = new Transaction();
		transaction.setFromAccountId(request.getFromAccountId());
		transaction.setToAccountId(request.getToAccountId());
		transaction.setAmount(request.getAmount());
		transaction.setType(TransactionType.TRANSFER);
		transaction.setStatus(TransactionStatus.PENDING);
		transaction.setTransactionDate(LocalDateTime.now());
		transaction = transactionRepository.save(transaction);

		try {
			// Verify both accounts exist and source has sufficient funds
			AccountDto sourceAccount = accountServiceClient.getAccountById(request.getFromAccountId());
			AccountDto targetAccount = accountServiceClient.getAccountById(request.getToAccountId());

			if (sourceAccount == null) {
				throw new AccountNotFoundException("Source account not found with ID: " + request.getFromAccountId());
			}
			if (targetAccount == null) {
				throw new AccountNotFoundException("Target account not found with ID: " + request.getToAccountId());
			}
			if (sourceAccount.getBalance() < request.getAmount()) {
				throw new InsufficientFundsException(
						"Insufficient funds in source account: " + request.getFromAccountId());
			}

			if (request.getFromAccountId().equals(request.getToAccountId())) {
				throw new InvalidTransactionException("Cannot transfer funds to the same account.");
			}

			// Perform withdrawal from source and deposit to target via Feign Clients
			// Note: In a real-world scenario, for distributed transactions, you'd consider
			// Sagas or a 2PC (Two-Phase Commit) pattern if strict atomicity across services
			// is required.
			// For simplicity, here we assume the Account Service's deposit/withdraw
			// operations are atomic.
			WithdrawRequestDto withdrawRequestDto = new WithdrawRequestDto(transaction.getTransactionId(),
					request.getAmount());
			accountServiceClient.withdrawFunds(request.getFromAccountId(), withdrawRequestDto);

			DepositRequestDto depositRequestDto = new DepositRequestDto(transaction.getTransactionId(),
					request.getAmount());
			accountServiceClient.depositFunds(request.getToAccountId(), depositRequestDto);

			// Update Transaction status to SUCCESS
			transaction.setStatus(TransactionStatus.SUCCESS);
			transaction = transactionRepository.save(transaction);

			// Send Notifications (asynchronously, best effort)
			sendNotification(sourceAccount.getUserId(), "Fund Transfer Alert",
					"A transfer of " + request.getAmount() + " has been made from your account "
							+ sourceAccount.getAccountNumber() + " to " + targetAccount.getAccountNumber()
							+ ". Transaction ID: " + transaction.getTransactionId(),
					NotificationRequestDto.NotificationType.EMAIL);

			sendNotification(targetAccount.getUserId(), "Fund Received Alert",
					"You have received " + request.getAmount() + " in your account " + targetAccount.getAccountNumber()
							+ " from " + sourceAccount.getAccountNumber() + ". Transaction ID: "
							+ transaction.getTransactionId(),
					NotificationRequestDto.NotificationType.EMAIL);

		} catch (HttpClientErrorException e) {
			transaction.setStatus(TransactionStatus.FAILED);
			transactionRepository.save(transaction);
			throw new TransactionProcessingException(
					"Transfer failed due to Account Service error: " + e.getResponseBodyAsString(), e);
		} catch (AccountNotFoundException | InsufficientFundsException | InvalidTransactionException e) {
			transaction.setStatus(TransactionStatus.FAILED);
			transactionRepository.save(transaction);
			throw e;
		} catch (Exception e) {
			transaction.setStatus(TransactionStatus.FAILED);
			transactionRepository.save(transaction);
			throw new TransactionProcessingException("Transfer failed unexpectedly: " + e.getMessage(), e);
		}
		return transaction;
	}

	public Optional<Transaction> getTransactionById(String transactionId) {
		return transactionRepository.findById(transactionId);
	}

	public List<Transaction> getTransactionsByAccountId(String accountId) {
		return transactionRepository.findByFromAccountIdOrToAccountId(accountId, accountId);
	}

	private void sendNotification(String userId, String subject, String message,
			NotificationRequestDto.NotificationType type) {
		try {
			NotificationRequestDto notificationRequest = new NotificationRequestDto(userId, type,
					subject + ": " + message);
			if (type == NotificationRequestDto.NotificationType.EMAIL) {
				notificationServiceClient.sendEmailNotification(notificationRequest);
			} else if (type == NotificationRequestDto.NotificationType.SMS) {
				notificationServiceClient.sendSmsNotification(notificationRequest);
			}
		} catch (Exception e) {
			System.err.println("Failed to send notification for user " + userId + ": " + e.getMessage());
		}
	}
}
