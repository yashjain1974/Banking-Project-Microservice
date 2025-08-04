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
     */
    @Override
    @Transactional
    public AccountResponse createAccount(AccountCreationRequest request) {
        try {
            UserDto user = userServiceClient.getUserProfileById(request.getUserId());
            
            if (user == null) {
                throw new AccountCreationException("User not found with ID: " + request.getUserId());
            }

            if (user.getKycStatus() != UserDto.KycStatus.VERIFIED) {
                throw new AccountCreationException("Account creation denied: User KYC status is " + user.getKycStatus() + ". Must be VERIFIED.");
            }

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
        } catch (AccountCreationException e) {
            throw e;
        } catch (Exception e) {
            throw new AccountCreationException("Failed to create account: " + e.getMessage(), e);
        }
    }

    /**
     * Deposits funds into a specified account.
     */
    @Override
    @Transactional
    public AccountResponse depositFunds(String accountId, DepositRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        if (request.getAmount() <= 0) {
            throw new AccountProcessingException("Deposit amount must be positive.");
        }
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

    /**
     * Retrieves account details by account ID.
     */
    @Override
    public Optional<AccountResponse> getAccountById(String accountId) {
        return accountRepository.findById(accountId)
                                .map(this::mapToAccountResponse);
    }

    /**
     * Retrieves account details by account number.
     */
    @Override
    public Optional<AccountResponse> getAccountByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                                .map(this::mapToAccountResponse);
    }

    /**
     * Retrieves all accounts associated with a specific user ID.
     */
    @Override
    public List<AccountResponse> getAccountsByUserId(String userId) {
        return accountRepository.findByUserId(userId)
                                .stream()
                                .map(this::mapToAccountResponse)
                                .collect(Collectors.toList());
    }

    /**
     * Updates the status of an account.
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
     * Deletes or closes an account.
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
     * Helper method to generate a unique 10-digit account number.
     * Ensures the number is always positive.
     */
    private String generateUniqueAccountNumber() {
        // Get the absolute value of the most significant bits to ensure a positive number
        // Modulo by 10 billion to get a number within 10 digits
        long positiveNumber = Math.abs(UUID.randomUUID().getMostSignificantBits() % 10_000_000_000L);
        // Format to a 10-digit string with leading zeros if necessary
        return String.format("%010d", positiveNumber);
    }
}