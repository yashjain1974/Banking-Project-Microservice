package com.creditcardservice.proxyservice;

import com.creditcardservice.dto.AccountDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

import java.time.LocalDateTime; // For AccountDto fallback
import java.util.Collections;
import java.util.List;

@FeignClient(name = "account-service", path = "/accounts")
public interface AccountServiceClient {

    @GetMapping("/{accountId}")
    @CircuitBreaker(name = "accountService", fallbackMethod = "getAccountByIdFallback")
    @Retry(name = "accountService")
    AccountDto getAccountById(@PathVariable("accountId") String accountId);

    default AccountDto getAccountByIdFallback(String accountId, Throwable t) {
        System.err.println("Fallback triggered for AccountService.getAccountById for account " + accountId + ": " + t.getMessage());
        // For card issuance, if account cannot be validated, it should fail.
        // Throwing an exception here ensures the card issuance process fails.
        throw new RuntimeException("Account service unavailable or account not found via fallback for ID: " + accountId, t);
    }

    @GetMapping("/user/{userId}")
    @CircuitBreaker(name = "accountService", fallbackMethod = "getAccountsByUserIdFallback")
    @Retry(name = "accountService")
    List<AccountDto> getAccountsByUserId(@PathVariable("userId") String userId);

    default List<AccountDto> getAccountsByUserIdFallback(String userId, Throwable t) {
        System.err.println("Fallback triggered for AccountService.getAccountsByUserId for user " + userId + ": " + t.getMessage());
        return Collections.emptyList(); // Return empty list gracefully
    }
}