package com.accountMicroservice.service;

import java.util.List;
import java.util.Optional;

import com.accountMicroservice.dto.AccountCreationRequest;
import com.accountMicroservice.dto.AccountResponse;
import com.accountMicroservice.dto.AccountUpdateRequest;
import com.accountMicroservice.dto.DepositRequest;
import com.accountMicroservice.dto.WithdrawRequest;
import com.accountMicroservice.exception.AccountCreationException;
import com.accountMicroservice.exception.AccountNotFoundException;
import com.accountMicroservice.exception.AccountProcessingException;
import com.accountMicroservice.exception.InsufficientFundsException;

/**
 * Interface for the Account Service, defining the core business operations
 * related to managing user accounts.
 */
public interface AccountService {

    /**
     * Creates a new bank account for a user.
     * @param request The AccountCreationRequest DTO.
     * @return The created AccountResponse DTO.
     * @throws AccountCreationException if account creation fails.
     */
    AccountResponse createAccount(AccountCreationRequest request);

    /**
     * Retrieves account details by account ID.
     * @param accountId The ID of the account.
     * @return An Optional containing the AccountResponse DTO if found, or empty otherwise.
     */
    Optional<AccountResponse> getAccountById(String accountId);

    /**
     * Retrieves account details by account number.
     * @param accountNumber The account number.
     * @return An Optional containing the AccountResponse DTO if found, or empty otherwise.
     */
    Optional<AccountResponse> getAccountByAccountNumber(String accountNumber); // <--- NEW METHOD

    /**
     * Retrieves all accounts associated with a specific user ID.
     * @param userId The ID of the user.
     * @return A list of AccountResponse DTOs.
     */
    List<AccountResponse> getAccountsByUserId(String userId);

    /**
     * Updates the status of an account (e.g., ACTIVE to CLOSED).
     * @param accountId The ID of the account to update.
     * @param request The AccountUpdateRequest DTO containing the new status.
     * @return The updated AccountResponse DTO.
     * @throws AccountNotFoundException if the account is not found.
     * @throws AccountProcessingException if the update fails.
     */
    AccountResponse updateAccountStatus(String accountId, AccountUpdateRequest request);

    /**
     * Deposits funds into a specified account.
     * @param accountId The ID of the account to deposit into.
     * @param request The DepositRequest DTO.
     * @return The updated AccountResponse DTO.
     * @throws AccountNotFoundException if the account is not found.
     * @throws AccountProcessingException if the deposit fails.
     */
    AccountResponse depositFunds(String accountId, DepositRequest request);

    /**
     * Withdraws funds from a specified account.
     * @param accountId The ID of the account to withdraw from.
     * @param request The WithdrawRequest DTO.
     * @return The updated AccountResponse DTO.
     * @throws AccountNotFoundException if the account is not found.
     * @throws InsufficientFundsException if the account has insufficient funds.
     * @throws AccountProcessingException if the withdrawal fails.
     */
    AccountResponse withdrawFunds(String accountId, WithdrawRequest request);

    /**
     * Deletes or closes an account.
     * @param accountId The ID of the account to delete.
     * @throws AccountNotFoundException if the account is not found.
     * @throws AccountProcessingException if the deletion fails.
     */
    void deleteAccount(String accountId);
}