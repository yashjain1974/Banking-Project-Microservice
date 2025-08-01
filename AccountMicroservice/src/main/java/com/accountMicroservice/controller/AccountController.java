package com.accountMicroservice.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.accountMicroservice.dto.AccountCreationRequest;
import com.accountMicroservice.dto.AccountResponse;
import com.accountMicroservice.dto.AccountUpdateRequest;
import com.accountMicroservice.dto.DepositRequest;
import com.accountMicroservice.dto.WithdrawRequest;
import com.accountMicroservice.exception.AccountCreationException;
import com.accountMicroservice.exception.AccountNotFoundException;
import com.accountMicroservice.exception.AccountProcessingException;
import com.accountMicroservice.exception.InsufficientFundsException;
import com.accountMicroservice.service.AccountService;

import jakarta.validation.Valid; // For input validation

@RestController // Marks this class as a REST controller
@RequestMapping("/accounts") // Base path for all endpoints in this controller
public class AccountController {

    private final AccountService accountService;

    @Autowired // Injects the AccountService implementation
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Handles POST /accounts/create requests.
     * Creates a new bank account.
     *
     * @param request The AccountCreationRequest DTO containing userId, accountType, and initialBalance.
     * @return ResponseEntity with the created AccountResponse and HTTP status 201 (Created).
     * @throws AccountCreationException if the account creation fails (e.g., user not found, duplicate account number).
     */
    @PostMapping("/create")
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountCreationRequest request) {
        // @Valid triggers validation defined in AccountCreationRequest DTO
        AccountResponse account = accountService.createAccount(request);
        return new ResponseEntity<>(account, HttpStatus.CREATED);
    }

    /**
     * Handles GET /accounts/user/{userId} requests.
     * Retrieves all accounts associated with a specific user.
     *
     * @param userId The ID of the user.
     * @return ResponseEntity with a list of AccountResponse DTOs and HTTP status 200 (OK).
     * Returns 204 No Content if no accounts are found for the user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AccountResponse>> getAccountsByUserId(@PathVariable String userId) {
        List<AccountResponse> accounts = accountService.getAccountsByUserId(userId);
        if (accounts.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(accounts, HttpStatus.OK);
    }

    /**
     * Handles GET /accounts/{accountId} requests.
     * Retrieves account details by account ID.
     *
     * @param accountId The ID of the account.
     * @return ResponseEntity with the AccountResponse DTO and HTTP status 200 (OK),
     * or 404 (Not Found) if the account does not exist.
     */
    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable String accountId) {
        Optional<AccountResponse> account = accountService.getAccountById(accountId);
        return account.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                      .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));
    }

    /**
     * Handles PUT /accounts/{accountId} requests (for updating status).
     * Updates the status of an account.
     *
     * @param accountId The ID of the account to update.
     * @param request The AccountUpdateRequest DTO containing the new status.
     * @return ResponseEntity with the updated AccountResponse DTO and HTTP status 200 (OK).
     * @throws AccountNotFoundException if the account is not found.
     * @throws AccountProcessingException if the update fails.
     */
    @PutMapping("/{accountId}")
    public ResponseEntity<AccountResponse> updateAccountStatus(@PathVariable String accountId,
                                                               @Valid @RequestBody AccountUpdateRequest request) {
        AccountResponse updatedAccount = accountService.updateAccountStatus(accountId, request);
        return new ResponseEntity<>(updatedAccount, HttpStatus.OK);
    }

    /**
     * Handles DELETE /accounts/{accountId} requests.
     * Deletes or closes an account.
     *
     * @param accountId The ID of the account to delete.
     * @return ResponseEntity with HTTP status 204 (No Content) upon successful deletion.
     * @throws AccountNotFoundException if the account is not found.
     * @throws AccountProcessingException if the deletion fails.
     */
    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String accountId) {
        accountService.deleteAccount(accountId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 indicates successful processing with no content to return
    }

    /**
     * Handles POST /accounts/{accountId}/deposit requests.
     * This endpoint is specifically designed for inter-service communication (e.g., from Transaction Service).
     * Deposits funds into a specified account.
     *
     * @param accountId The ID of the account to deposit into.
     * @param request The DepositRequest DTO from the calling service.
     * @return ResponseEntity with the updated AccountResponse DTO and HTTP status 200 (OK).
     * @throws AccountNotFoundException if the account is not found.
     * @throws AccountProcessingException if the deposit fails.
     */
    @PostMapping("/{accountId}/deposit")
    public ResponseEntity<AccountResponse> depositFunds(@PathVariable String accountId,
                                                        @Valid @RequestBody DepositRequest request) {
        AccountResponse updatedAccount = accountService.depositFunds(accountId, request);
        return new ResponseEntity<>(updatedAccount, HttpStatus.OK);
    }

    /**
     * Handles POST /accounts/{accountId}/withdraw requests.
     * This endpoint is specifically designed for inter-service communication (e.g., from Transaction Service).
     * Withdraws funds from a specified account.
     *
     * @param accountId The ID of the account to withdraw from.
     * @param request The WithdrawRequest DTO from the calling service.
     * @return ResponseEntity with the updated AccountResponse DTO and HTTP status 200 (OK).
     * @throws AccountNotFoundException if the account is not found.
     * @throws InsufficientFundsException if the account has insufficient funds.
     * @throws AccountProcessingException if the withdrawal fails.
     */
    @PostMapping("/{accountId}/withdraw")
    public ResponseEntity<AccountResponse> withdrawFunds(@PathVariable String accountId,
                                                         @Valid @RequestBody WithdrawRequest request) {
        AccountResponse updatedAccount = accountService.withdrawFunds(accountId, request);
        return new ResponseEntity<>(updatedAccount, HttpStatus.OK);
    }
}
