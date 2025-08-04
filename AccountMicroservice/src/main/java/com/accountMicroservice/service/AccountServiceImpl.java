package com.accountMicroservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final UserServiceClient userServiceClient;

    @Autowired
    public AccountServiceImpl(AccountRepository accountRepository,
                              UserServiceClient userServiceClient) {
        this.accountRepository = accountRepository;
        this.userServiceClient = userServiceClient;
    }

    /**
     * Creates a new bank account for a user.
     * Validates user existence and KYC status via User Service.
     * @param request The AccountCreationRequest DTO.
     * @return The created AccountResponse DTO.
     * @throws AccountCreationException if account creation fails (e.g., user not found, KYC not verified).
     */
    @Override
    @Transactional
    public AccountResponse createAccount(AccountCreationRequest request) {
        try {
            // 1. Validate User existence and KYC status via User Service
            UserDto user = userServiceClient.getUserProfileById(request.getUserId()); // This returns UserDto directly
            
            if (user == null) { // <--- CORRECTED: Check for null directly
                throw new AccountCreationException("User not found with ID: " + request.getUserId());
            }

            if (user.getKycStatus() != UserDto.KycStatus.VERIFIED) { // <--- KYC CHECK
                throw new AccountCreationException("Account creation denied: User KYC status is " + user.getKycStatus() + ". Must be VERIFIED.");
            }

            // 2. Generate a unique account number
            String newAccountNumber = generateUniqueAccountNumber();
            while (accountRepository.findByAccountNumber(newAccountNumber).isPresent()) {
                newAccountNumber = generateUniqueAccountNumber();
            }

            Account account = new Account();
            account.setUserId(request.getUserId());
            account.setAccountNumber(newAccountNumber);
            account.setAccountType(request.getAccountType());
            account.setBalance(request.getInitialBalance());
            account.setStatus(AccountStatus.ACTIVE);
            account.setCreatedAt(LocalDateTime.now());

            account = accountRepository.save(account);
            return mapToAccountResponse(account);

        } catch (DataIntegrityViolationException e) {
            throw new AccountCreationException("Failed to create account due to data integrity violation (e.g., duplicate account number).", e);
        } catch (HttpClientErrorException e) {
            throw new AccountProcessingException("Failed to validate user due to User Service error: " + e.getResponseBodyAsString(), e);
        } catch (AccountCreationException e) { // Re-throw specific exception
            throw e;
        } catch (Exception e) {
            throw new AccountCreationException("Failed to create account: " + e.getMessage(), e);
        }
    }

    /**
     * Deposits funds into a specified account.
     * Validates account status (e.g., ACTIVE) but KYC is usually checked at transaction initiation.
     */
    @Override
    @Transactional
    public AccountResponse depositFunds(String accountId, DepositRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        if (request.getAmount() <= 0) {
            throw new AccountProcessingException("Deposit amount must be positive.");
        }
        // Optional: Check if account is ACTIVE before deposit
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountProcessingException("Deposit denied: Account ID " + accountId + " is " + account.getStatus() + ".");
        }

        account.setBalance(account.getBalance() + request.getAmount());
        try {
            account = accountRepository.save(account);
            System.out.println("Deposit of " + request.getAmount() + " to account " + accountId + " for transaction " + request.getTransactionId() + " successful.");
            return mapToAccountResponse(account);
        } catch (Exception e) {
            throw new AccountProcessingException("Failed to process deposit for account ID: " + accountId, e);
        }
    }

    /**
     * Withdraws funds from a specified account.
     * Validates account status (e.g., ACTIVE) but KYC is usually checked at transaction initiation.
     */
    @Override
    @Transactional
    public AccountResponse withdrawFunds(String accountId, WithdrawRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        if (request.getAmount() <= 0) {
            throw new AccountProcessingException("Withdrawal amount must be positive.");
        }
        if (account.getBalance() < request.getAmount()) {
            throw new InsufficientFundsException("Insufficient funds in account ID: " + accountId);
        }
        // Optional: Check if account is ACTIVE before withdrawal
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountProcessingException("Withdrawal denied: Account ID " + accountId + " is " + account.getStatus() + ".");
        }

        account.setBalance(account.getBalance() - request.getAmount());
        try {
            account = accountRepository.save(account);
            System.out.println("Withdrawal of " + request.getAmount() + " from account " + accountId + " for transaction " + request.getTransactionId() + " successful.");
            return mapToAccountResponse(account);
        } catch (Exception e) {
            throw new AccountProcessingException("Failed to process withdrawal for account ID: " + accountId, e);
        }
    }

    // --- Existing methods (getAccountById, getAccountsByUserId, updateAccountStatus, deleteAccount) ---
    @Override
    public Optional<AccountResponse> getAccountById(String accountId) {
        return accountRepository.findById(accountId)
                                .map(this::mapToAccountResponse);
    }

    @Override
    public List<AccountResponse> getAccountsByUserId(String userId) {
        return accountRepository.findByUserId(userId)
                                .stream()
                                .map(this::mapToAccountResponse)
                                .collect(Collectors.toList());
    }

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

    private String generateUniqueAccountNumber() {
        return String.format("%010d", UUID.randomUUID().getMostSignificantBits() % 10_000_000_000L);
    }
}
