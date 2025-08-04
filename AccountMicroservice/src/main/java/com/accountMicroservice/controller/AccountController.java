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
import com.accountMicroservice.exception.AccountNotFoundException;
import com.accountMicroservice.service.AccountService;

import jakarta.validation.Valid; // For input validation

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Handles POST /accounts/create requests.
     */
    @PostMapping("/create")
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountCreationRequest request) {
        AccountResponse account = accountService.createAccount(request);
        return new ResponseEntity<>(account, HttpStatus.CREATED);
    }

    /**
     * Handles GET /accounts/user/{userId} requests.
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
     */
    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable String accountId) {
        Optional<AccountResponse> account = accountService.getAccountById(accountId);
        return account.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                      .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));
    }

    /**
     * Handles GET /accounts/number/{accountNumber} requests.
     * NEW ENDPOINT
     */
    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<AccountResponse> getAccountByAccountNumber(@PathVariable String accountNumber) {
        Optional<AccountResponse> account = accountService.getAccountByAccountNumber(accountNumber);
        return account.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                      .orElseThrow(() -> new AccountNotFoundException("Account not found with number: " + accountNumber));
    }

    /**
     * Handles PUT /accounts/{accountId} requests (for updating status).
     */
    @PutMapping("/{accountId}")
    public ResponseEntity<AccountResponse> updateAccountStatus(@PathVariable String accountId,
                                                               @Valid @RequestBody AccountUpdateRequest request) {
        AccountResponse updatedAccount = accountService.updateAccountStatus(accountId, request);
        return new ResponseEntity<>(updatedAccount, HttpStatus.OK);
    }

    /**
     * Handles DELETE /accounts/{accountId} requests.
     */
    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String accountId) {
        accountService.deleteAccount(accountId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * Handles POST /accounts/{accountId}/deposit requests.
     */
    @PostMapping("/{accountId}/deposit")
    public ResponseEntity<AccountResponse> depositFunds(@PathVariable String accountId,
                                                        @Valid @RequestBody DepositRequest request) {
        AccountResponse updatedAccount = accountService.depositFunds(accountId, request);
        return new ResponseEntity<>(updatedAccount, HttpStatus.OK);
    }

    /**
     * Handles POST /accounts/{accountId}/withdraw requests.
     */
    @PostMapping("/{accountId}/withdraw")
    public ResponseEntity<AccountResponse> withdrawFunds(@PathVariable String accountId,
                                                         @Valid @RequestBody WithdrawRequest request) {
        AccountResponse updatedAccount = accountService.withdrawFunds(accountId, request);
        return new ResponseEntity<>(updatedAccount, HttpStatus.OK);
    }
}
