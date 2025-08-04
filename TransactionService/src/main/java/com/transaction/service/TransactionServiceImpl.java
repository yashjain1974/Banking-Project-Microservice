package com.transaction.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import com.transaction.dao.TransactionRepository;
import com.transaction.dto.AccountDto;
import com.transaction.dto.DepositRequest;
import com.transaction.dto.DepositRequestDto;
import com.transaction.dto.NotificationRequestDto;
import com.transaction.dto.TransferRequest; // Updated DTO
import com.transaction.dto.UserDto;
import com.transaction.dto.WithdrawRequest;
import com.transaction.dto.WithdrawRequestDto;
import com.transaction.event.TransactionCompletedEvent;
import com.transaction.exceptions.AccountNotFoundException;
import com.transaction.exceptions.InsufficientFundsException;
import com.transaction.exceptions.InvalidTransactionException;
import com.transaction.exceptions.TransactionProcessingException;
import com.transaction.exceptions.UnauthorizedUserException;
import com.transaction.model.Transaction;
import com.transaction.model.TransactionStatus;
import com.transaction.model.TransactionType;
import com.transaction.proxyService.AccountServiceClient;
import com.transaction.proxyService.LoanServiceClient;
import com.transaction.proxyService.NotificationServiceClient;
import com.transaction.proxyService.UserServiceClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountServiceClient accountServiceClient;
    private final LoanServiceClient loanServiceClient;
    private final KafkaTemplate<String, TransactionCompletedEvent> kafkaTemplate;
    private final NotificationServiceClient notificationServiceClient;
    private final UserServiceClient userServiceClient;

    @Autowired
    public TransactionServiceImpl(TransactionRepository transactionRepository,
                              AccountServiceClient accountServiceClient,
                              LoanServiceClient loanServiceClient,
                              KafkaTemplate<String, TransactionCompletedEvent> kafkaTemplate,
                              NotificationServiceClient notificationServiceClient,
                              UserServiceClient userServiceClient) {
        this.transactionRepository = transactionRepository;
        this.accountServiceClient = accountServiceClient;
        this.loanServiceClient = loanServiceClient;
        this.kafkaTemplate = kafkaTemplate;
        this.notificationServiceClient = notificationServiceClient;
        this.userServiceClient = userServiceClient;
    }

    /**
     * Helper method for KYC check.
     */
    private void checkKycStatus(String userId) {
        UserDto userProfile = userServiceClient.getUserProfileById(userId);
        if (userProfile == null) {
            throw new UnauthorizedUserException("User profile not found for transaction. Cannot proceed.");
        }
        if (userProfile.getKycStatus() != UserDto.KycStatus.VERIFIED) {
            throw new UnauthorizedUserException("Transaction denied: User KYC status is " + userProfile.getKycStatus() + ". Must be VERIFIED.");
        }
    }

    /**
     * Processes a deposit transaction.
     */
    @Override
    @Transactional
    public Transaction deposit(DepositRequest request) {
        Transaction transaction = new Transaction();
        transaction.setFromAccountId(null);
        transaction.setToAccountId(request.getAccountId());
        transaction.setAmount(request.getAmount());
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        try {
            AccountDto targetAccount = accountServiceClient.getAccountById(request.getAccountId());
            if (targetAccount == null) {
                throw new AccountNotFoundException("Target account not found with ID: " + request.getAccountId());
            }

            checkKycStatus(targetAccount.getUserId());

            DepositRequestDto depositRequestDto = new DepositRequestDto(transaction.getTransactionId(), request.getAmount());
            accountServiceClient.depositFunds(request.getAccountId(), depositRequestDto);

            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction = transactionRepository.save(transaction);

            String notificationMessage = "A deposit of " + request.getAmount() + " has been made to your account " + targetAccount.getAccountNumber() + ". Transaction ID: " + transaction.getTransactionId();
            publishTransactionCompletedEvent(
                transaction.getTransactionId(),
                targetAccount.getUserId(),
                targetAccount.getAccountId(),
                request.getAmount(),
                transaction.getType().name(),
                transaction.getStatus().name(),
                notificationMessage
            );

        } catch (HttpClientErrorException e) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new TransactionProcessingException("Deposit failed due to Account Service error: " + e.getResponseBodyAsString(), e);
        } catch (AccountNotFoundException | UnauthorizedUserException e) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw e;
        } catch (Exception e) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new TransactionProcessingException("Deposit failed unexpectedly: " + e.getMessage(), e);
        }
        return transaction;
    }

    /**
     * Processes a withdrawal transaction.
     */
    @Override
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
            AccountDto sourceAccount = accountServiceClient.getAccountById(request.getAccountId());
            if (sourceAccount == null) {
                throw new AccountNotFoundException("Source account not found with ID: " + request.getAccountId());
            }

            checkKycStatus(sourceAccount.getUserId());

            if (sourceAccount.getBalance() < request.getAmount()) {
                throw new InsufficientFundsException("Insufficient funds in account: " + request.getAccountId());
            }

            WithdrawRequestDto withdrawRequestDto = new WithdrawRequestDto(transaction.getTransactionId(), request.getAmount());
            accountServiceClient.withdrawFunds(request.getAccountId(), withdrawRequestDto);

            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction = transactionRepository.save(transaction);

            String notificationMessage = "A withdrawal of " + request.getAmount() + " has been made from your account " + sourceAccount.getAccountNumber() + ". Transaction ID: " + transaction.getTransactionId();
            publishTransactionCompletedEvent(
                transaction.getTransactionId(),
                sourceAccount.getUserId(),
                sourceAccount.getAccountId(),
                request.getAmount(),
                transaction.getType().name(),
                transaction.getStatus().name(),
                notificationMessage
            );

        } catch (HttpClientErrorException e) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new TransactionProcessingException("Withdrawal failed due to Account Service error: " + e.getResponseBodyAsString(), e);
        } catch (AccountNotFoundException | InsufficientFundsException | InvalidTransactionException | UnauthorizedUserException e) {
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

    /**
     * Processes a fund transfer transaction between two accounts.
     * Updated to use account numbers.
     */
    @Override
    @Transactional
    public Transaction transfer(TransferRequest request) {
        Transaction transaction = new Transaction();
        // Set initial account IDs to null, they will be resolved
        transaction.setFromAccountId(null);
        transaction.setToAccountId(null);
        transaction.setAmount(request.getAmount());
        transaction.setType(TransactionType.TRANSFER);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        try {
            // Resolve account numbers to account IDs
            AccountDto sourceAccount = accountServiceClient.getAccountByAccountNumber(request.getFromAccountNumber());
            AccountDto targetAccount = accountServiceClient.getAccountByAccountNumber(request.getToAccountNumber());

            if (sourceAccount == null) {
                throw new AccountNotFoundException("Source account not found with number: " + request.getFromAccountNumber());
            }
            if (targetAccount == null) {
                throw new AccountNotFoundException("Target account not found with number: " + request.getToAccountNumber());
            }

            // Set resolved account IDs to the transaction entity
            transaction.setFromAccountId(sourceAccount.getAccountId());
            transaction.setToAccountId(targetAccount.getAccountId());
            transaction = transactionRepository.save(transaction); // Save again with resolved IDs

            // Perform KYC check for both source and target users
            checkKycStatus(sourceAccount.getUserId());
            checkKycStatus(targetAccount.getUserId());

            if (sourceAccount.getBalance() < request.getAmount()) {
                throw new InsufficientFundsException("Insufficient funds in source account: " + request.getFromAccountNumber());
            }

            if (sourceAccount.getAccountId().equals(targetAccount.getAccountId())) { // Compare resolved IDs
                throw new InvalidTransactionException("Cannot transfer funds to the same account.");
            }

            WithdrawRequestDto withdrawRequestDto = new WithdrawRequestDto(transaction.getTransactionId(), request.getAmount());
            accountServiceClient.withdrawFunds(sourceAccount.getAccountId(), withdrawRequestDto); // Use resolved ID

            DepositRequestDto depositRequestDto = new DepositRequestDto(transaction.getTransactionId(), request.getAmount());
            accountServiceClient.depositFunds(targetAccount.getAccountId(), depositRequestDto); // Use resolved ID

            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction = transactionRepository.save(transaction);

            String senderNotificationMessage = "A transfer of " + request.getAmount() + " has been made from your account " + sourceAccount.getAccountNumber() + " to " + targetAccount.getAccountNumber() + ". Transaction ID: " + transaction.getTransactionId();
            publishTransactionCompletedEvent(
                transaction.getTransactionId(),
                sourceAccount.getUserId(),
                sourceAccount.getAccountId(),
                request.getAmount(),
                transaction.getType().name(),
                transaction.getStatus().name(),
                senderNotificationMessage
            );

            String receiverNotificationMessage = "You have received " + request.getAmount() + " in your account " + targetAccount.getAccountNumber() + " from " + sourceAccount.getAccountNumber() + ". Transaction ID: " + transaction.getTransactionId();
            publishTransactionCompletedEvent(
                transaction.getTransactionId(),
                targetAccount.getUserId(),
                targetAccount.getAccountId(),
                request.getAmount(),
                transaction.getType().name(),
                transaction.getStatus().name(),
                receiverNotificationMessage
            );

        } catch (HttpClientErrorException e) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new TransactionProcessingException("Transfer failed due to Account Service error: " + e.getResponseBodyAsString(), e);
        } catch (AccountNotFoundException | InsufficientFundsException | InvalidTransactionException | UnauthorizedUserException e) {
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

    /**
     * Retrieves a transaction by its ID.
     */
    @Override
    public Optional<Transaction> getTransactionById(String transactionId) {
        return transactionRepository.findById(transactionId);
    }

    /**
     * Retrieves all transactions for a given account ID (either as fromAccountId or toAccountId).
     */
    @Override
    public List<Transaction> getTransactionsByAccountId(String accountId) {
        return transactionRepository.findByFromAccountIdOrToAccountId(accountId, accountId);
    }

    @CircuitBreaker(name = "kafkaNotificationPublisher", fallbackMethod = "publishTransactionCompletedEventFallback")
    private void publishTransactionCompletedEvent(String transactionId, String userId, String accountId, Double amount, String type, String status, String notificationMessage) {
        TransactionCompletedEvent event = new TransactionCompletedEvent(
            transactionId,
            userId,
            accountId,
            amount,
            type,
            status,
            notificationMessage
        );
        kafkaTemplate.send("transaction-events", event);
        System.out.println("Published transaction event to Kafka: " + event.getTransactionId());
    }

    private void publishTransactionCompletedEventFallback(String transactionId, String userId, String accountId, Double amount, String type, String status, String notificationMessage, Throwable t) {
        System.err.println("Fallback triggered for Kafka publishing for transaction " + transactionId + " due to: " + t.getMessage());
        System.err.println("Attempting to send notification directly via Notification Service Feign client.");

        try {
            NotificationRequestDto notificationRequest = new NotificationRequestDto(userId, NotificationRequestDto.NotificationType.EMAIL, "Fallback: " + notificationMessage);
            notificationServiceClient.sendEmailNotification(notificationRequest);
            System.out.println("Notification sent directly via Feign client for transaction: " + transactionId);
        } catch (Exception feignException) {
            System.err.println("Failed to send notification directly via Feign client for transaction " + transactionId + ": " + feignException.getMessage());
        }
    }
}