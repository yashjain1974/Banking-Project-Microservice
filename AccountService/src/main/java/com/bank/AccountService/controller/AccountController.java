package com.bank.AccountService.controller;
import com.bank.AccountService.dto.AccountResponse;
import com.bank.AccountService.dto.ApiResponse;
import com.bank.AccountService.dto.CreateAccountRequest;
import com.bank.AccountService.dto.UpdateAccountRequest;
import com.bank.AccountService.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/create")
//    @PreAuthorize("hasAuthority('SCOPE_user')") // adjust based on token scopes
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.ok(accountService.createAccount(request));
    }

    @GetMapping("/user/{userId}")
//    @PreAuthorize("hasAuthority('SCOPE_user')")
    public ResponseEntity<List<AccountResponse>> getAccountsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(accountService.getAccountsByUser(userId));
    }

    @GetMapping("/{accountId}")
//    @PreAuthorize("hasAuthority('SCOPE_user')")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable Long accountId) {
        return ResponseEntity.ok(accountService.getAccountById(accountId));
    }

    @PutMapping("/{accountId}")
//    @PreAuthorize("hasAuthority('SCOPE_user')")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable Long accountId,
                                                         @Valid @RequestBody UpdateAccountRequest request) {
        return ResponseEntity.ok(accountService.updateAccount(accountId, request));
    }

    @DeleteMapping("/{accountId}")
//    @PreAuthorize("hasAuthority('SCOPE_user')")
    public ResponseEntity<ApiResponse> deleteAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(accountService.deleteAccount(accountId));
    }
}
