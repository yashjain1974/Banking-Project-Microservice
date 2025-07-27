package com.transaction.proxyService;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.transaction.dto.AccountDto;
import com.transaction.dto.DepositRequestDto;
import com.transaction.dto.WithdrawRequestDto;
import com.transaction.exceptions.TransactionProcessingException;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

//@FeignClient annotation specifies the name of the target service (as registered in Eureka)
//and optionally a context-path if the target service has one.
//The name "account-service" should match the 'spring.application.name' in the Account Service's application.yml
@FeignClient(name = "account-service", path = "/accounts")
public interface AccountServiceClient {

 /**
  * Retrieves account details by account ID from the Account Service.
  * Corresponds to GET /accounts/{accountId}
  * @param accountId The ID of the account to retrieve.
  * @return An AccountDto object containing the account details.
  */
	@GetMapping("/{accountId}")
    @CircuitBreaker(name = "accountService", fallbackMethod = "getAccountByIdFallback")
    @Retry(name = "accountService") // Optional: retry before breaking circuit
 AccountDto getAccountById(@PathVariable("accountId") String accountId);
	
	 // Fallback method for getAccountById
    default AccountDto getAccountByIdFallback(String accountId, Throwable t) {
        System.err.println("Fallback for getAccountById: " + t.getMessage());
        // You could return a default/empty AccountDto, or throw a specific exception
        throw new TransactionProcessingException("Account service is unavailable or account not found via fallback.", t);
    }

 /**
  * Retrieves all accounts associated with a specific user ID from the Account Service.
  * Corresponds to GET /accounts/user/{userId}
  * @param userId The ID of the user whose accounts are to be retrieved.
  * @return A list of AccountDto objects.
  */
 @GetMapping("/user/{userId}")
 List<AccountDto> getAccountsByUserId(@PathVariable("userId") String userId);

 // You might also need methods for updating account balances if the Account Service
 // exposes such an endpoint, e.g., a PUT or POST for balance updates.
 // For now, we'll stick to the read operations mentioned in your doc.
 
 @PostMapping("/{accountId}/deposit")
 @CircuitBreaker(name = "accountService", fallbackMethod = "depositFundsFallback")
 @Retry(name = "accountService")
 AccountDto depositFunds(@PathVariable("accountId") String accountId, @RequestBody DepositRequestDto requestDto);

 
//Fallback method for depositFunds
 default AccountDto depositFundsFallback(String accountId, DepositRequestDto requestDto, Throwable t) {
     System.err.println("Fallback for depositFunds: " + t.getMessage());
     throw new TransactionProcessingException("Account service deposit failed via fallback.", t);
 }
 /**
  * Sends a withdrawal request to the Account Service to update an account's balance.
  * Assumes the Account Service has an endpoint like POST /accounts/{accountId}/withdraw.
  * @param accountId The ID of the account to withdraw from.
  * @param requestDto The WithdrawRequestDto containing the amount and transaction reference.
  * @return The updated AccountDto after the withdrawal.
  */
 @PostMapping("/{accountId}/withdraw")
 AccountDto withdrawFunds(@PathVariable("accountId") String accountId, @RequestBody WithdrawRequestDto requestDto);
}