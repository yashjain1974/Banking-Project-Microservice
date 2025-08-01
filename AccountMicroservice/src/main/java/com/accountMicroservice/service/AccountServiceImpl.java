package com.accountMicroservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException; // For unique constraint violations
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import com.accountMicroservice.dao.AccountRepository;
import com.accountMicroservice.dto.AccountCreationRequest;
import com.accountMicroservice.dto.AccountResponse;
import com.accountMicroservice.dto.AccountUpdateRequest;
import com.accountMicroservice.dto.DepositRequest;
import com.accountMicroservice.dto.UserDto;
import com.accountMicroservice.dto.WithdrawRequest;
import com.accountMicroservice.exception.AccountCreationException;
import com.accountMicroservice.exception.AccountNotFoundException;
import com.accountMicroservice.exception.AccountProcessingException;
import com.accountMicroservice.exception.InsufficientFundsException;
import com.accountMicroservice.model.Account;
import com.accountMicroservice.model.AccountStatus;
import com.accountMicroservice.proxyService.UserServiceClient;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserServiceClient userServiceClient; // Inject UserServiceClient

    @Autowired
    public AccountServiceImpl(AccountRepository accountRepository,
                              UserServiceClient userServiceClient) {
        this.accountRepository = accountRepository;
        this.userServiceClient = userServiceClient;
    }

    /**
     * Creates a new bank account for a user.
     * Validates user existence via User Service.
     * @param request The AccountCreationRequest DTO.
     * @return The created AccountResponse DTO.
     * @throws AccountCreationException if account creation fails (e.g., user not found, duplicate account number).
     */
    @Override
    @Transactional
    public AccountResponse createAccount(AccountCreationRequest request) {
        try {
            // 1. Validate User existence via User Service
            UserDto user = userServiceClient.getUserById(request.getUserId());
            if (user == null) {
                throw new AccountCreationException("User not found with ID: " + request.getUserId());
            }
            // Optional: Check if user role is CUSTOMER, etc.

            // 2. Generate a unique account number (simple example, real banks have complex logic)
            String newAccountNumber = generateUniqueAccountNumber();
            while (accountRepository.findByAccountNumber(newAccountNumber).isPresent()) {
                newAccountNumber = generateUniqueAccountNumber(); // Regenerate if already exists
            }

            Account account = new Account();
            account.setUserId(request.getUserId());
            account.setAccountNumber(newAccountNumber);
            account.setAccountType(request.getAccountType());
            account.setBalance(request.getInitialBalance());
            account.setStatus(AccountStatus.ACTIVE); // New accounts are active by default
            account.setCreatedAt(LocalDateTime.now());

            account = accountRepository.save(account);
            return mapToAccountResponse(account);

        } catch (DataIntegrityViolationException e) {
            // Catch database constraint violations, e.g., if accountNumber unique constraint fails unexpectedly
            throw new AccountCreationException("Failed to create account due to data integrity violation (e.g., duplicate account number).", e);
        } catch (HttpClientErrorException e) {
            // Catch errors from Feign client (e.g., User Service unavailable)
            throw new AccountProcessingException("Failed to validate user due to User Service error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new AccountCreationException("Failed to create account: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves account details by account ID.
     * @param accountId The ID of the account.
     * @return An Optional containing the AccountResponse DTO if found, or empty otherwise.
     */
    @Override
    public Optional<AccountResponse> getAccountById(String accountId) {
        return accountRepository.findById(accountId)
                                .map(this::mapToAccountResponse);
    }

    /**
     * Retrieves all accounts associated with a specific user ID.
     * @param userId The ID of the user.
     * @return A list of AccountResponse DTOs.
     */
    @Override
    public List<AccountResponse> getAccountsByUserId(String userId) {
        return accountRepository.findByUserId(userId)
                                .stream()
                                .map(this::mapToAccountResponse)
                                .collect(Collectors.toList());
    }

    /**
     * Updates the status of an account (e.g., ACTIVE to CLOSED).
     * @param accountId The ID of the account to update.
     * @param request The AccountUpdateRequest DTO containing the new status.
     * @return The updated AccountResponse DTO.
     * @throws AccountNotFoundException if the account is not found.
     * @throws AccountProcessingException if the update fails.
     */
    @Override
    @Transactional
    public AccountResponse updateAccountStatus(String accountId, AccountUpdateRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        account.setStatus(request.getStatus());
        try {
            account = accountRepository.save(account);
            return mapToAccountResponse(account);
        } catch (Exception e) {
            throw new AccountProcessingException("Failed to update account status for ID: " + accountId, e);
        }
    }

    /**
     * Deposits funds into a specified account.
     * This method is called by other services (e.g., Transaction Service).
     * @param accountId The ID of the account to deposit into.
     * @param request The DepositRequest DTO.
     * @return The updated AccountResponse DTO.
     * @throws AccountNotFoundException if the account is not found.
     * @throws AccountProcessingException if the deposit fails.
     */
    @Override
    @Transactional
    public AccountResponse depositFunds(String accountId, DepositRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        // Basic validation (more complex validation might be needed)
        if (request.getAmount() <= 0) {
            throw new AccountProcessingException("Deposit amount must be positive.");
        }

        account.setBalance(account.getBalance() + request.getAmount());
        try {
            account = accountRepository.save(account);
            // Log the transaction for auditing purposes (optional, as Transaction Service also logs)
            System.out.println("Deposit of " + request.getAmount() + " to account " + accountId + " for transaction " + request.getTransactionId() + " successful.");
            return mapToAccountResponse(account);
        } catch (Exception e) {
            throw new AccountProcessingException("Failed to process deposit for account ID: " + accountId, e);
        }
    }

    /**
     * Withdraws funds from a specified account.
     * This method is called by other services (e.g., Transaction Service).
     * @param accountId The ID of the account to withdraw from.
     * @param request The WithdrawRequest DTO.
     * @return The updated AccountResponse DTO.
     * @throws AccountNotFoundException if the account is not found.
     * @throws InsufficientFundsException if the account has insufficient funds.
     * @throws AccountProcessingException if the withdrawal fails.
     */
    @Override
    @Transactional
    public AccountResponse withdrawFunds(String accountId, WithdrawRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        // Basic validation
        if (request.getAmount() <= 0) {
            throw new AccountProcessingException("Withdrawal amount must be positive.");
        }
        if (account.getBalance() < request.getAmount()) {
            throw new InsufficientFundsException("Insufficient funds in account ID: " + accountId);
        }

        account.setBalance(account.getBalance() - request.getAmount());
        try {
            account = accountRepository.save(account);
            // Log the transaction for auditing purposes
            System.out.println("Withdrawal of " + request.getAmount() + " from account " + accountId + " for transaction " + request.getTransactionId() + " successful.");
            return mapToAccountResponse(account);
        } catch (Exception e) {
            throw new AccountProcessingException("Failed to process withdrawal for account ID: " + accountId, e);
        }
    }

    /**
     * Deletes or closes an account.
     * @param accountId The ID of the account to delete.
     * @throws AccountNotFoundException if the account is not found.
     * @throws AccountProcessingException if the deletion fails.
     */
    @Override
    @Transactional
    public void deleteAccount(String accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));
        try {
            accountRepository.delete(account);
            System.out.println("Account with ID: " + accountId + " deleted successfully.");
        } catch (Exception e) {
            throw new AccountProcessingException("Failed to delete account with ID: " + accountId, e);
        }
    }

    /**
     * Helper method to map Account entity to AccountResponse DTO.
     * @param account The Account entity.
     * @return The AccountResponse DTO.
     */
    private AccountResponse mapToAccountResponse(Account account) {
        return new AccountResponse(
                account.getAccountId(),
                account.getUserId(),
                account.getAccountNumber(),
                account.getAccountType(),
                account.getBalance(),
                account.getStatus(),
                account.getCreatedAt()
        );
    }

    /**
     * Helper method to generate a simple unique account number.
     * In a real system, this would be more robust (e.g., sequence, check digit).
     * @return A unique 10-digit string.
     */
    private String generateUniqueAccountNumber() {
        // Simple 10-digit number for demonstration.
        // In production, consider a dedicated service or more robust generation.
        return String.format("%010d", UUID.randomUUID().getMostSignificantBits() % 10_000_000_000L);
    }
}