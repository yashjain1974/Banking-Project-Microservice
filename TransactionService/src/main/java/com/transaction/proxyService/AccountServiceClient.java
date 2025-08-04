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
        System.err.println("Fallback triggered for getAccountById to account " + accountId + ": " + t.getMessage());
        // Instead of returning a mock, throw an exception to indicate service unavailability
        throw new TransactionProcessingException("Account service is unavailable or returned an error for account " + accountId, t);
    }

 /**
  * Retrieves account details by account number from the Account Service.
  * NEW METHOD
  */
 @GetMapping("/number/{accountNumber}") // Assuming Account Service exposes this endpoint
 @CircuitBreaker(name = "accountService", fallbackMethod = "getAccountByNumberFallback")
 @Retry(name = "accountService")
 AccountDto getAccountByAccountNumber(@PathVariable("accountNumber") String accountNumber);

 default AccountDto getAccountByNumberFallback(String accountNumber, Throwable t) {
     System.err.println("Fallback triggered for getAccountByAccountNumber for number " + accountNumber + ": " + t.getMessage());
     throw new TransactionProcessingException("Account service is unavailable or returned an error for account number " + accountNumber, t);
 }

 /**
  * Retrieves all accounts associated with a specific user ID from the Account Service.
  * Corresponds to GET /accounts/user/{userId}
  * @param userId The ID of the user whose accounts are to be retrieved.
  * @return A list of AccountDto objects.
  */
 @GetMapping("/user/{userId}")
 @CircuitBreaker(name = "accountService", fallbackMethod = "getAccountsByUserIdFallback") // Added CircuitBreaker for consistency
 @Retry(name = "accountService") // Added Retry for consistency
 List<AccountDto> getAccountsByUserId(@PathVariable("userId") String userId);
 
 default List<AccountDto> getAccountsByUserIdFallback(String userId, Throwable t) {
     System.err.println("Fallback triggered for getAccountsByUserId for user " + userId + ": " + t.getMessage());
     // Throw an exception as the real data cannot be retrieved
     throw new TransactionProcessingException("Account service is unavailable or returned an error for user " + userId, t);
 }


 // You might also need methods for updating account balances if the Account Service
 // exposes such an endpoint, e.g., a PUT or POST for balance updates.
 // For now, we'll stick to the read operations mentioned in your doc.
 
 @PostMapping("/{accountId}/deposit")
 @CircuitBreaker(name = "accountService", fallbackMethod = "depositFundsFallback")
 @Retry(name = "accountService")
 AccountDto depositFunds(@PathVariable("accountId") String accountId, @RequestBody DepositRequestDto requestDto);

 
//Fallback method for depositFunds
 default AccountDto depositFundsFallback(String accountId, DepositRequestDto requestDto, Throwable t) {
     System.err.println("Fallback triggered for depositFunds to account " + accountId + ": " + t.getMessage());
     // Throw an exception as the deposit could not be processed by the real service
     throw new TransactionProcessingException("Account service is unavailable or failed to process deposit for account " + accountId, t);
 }

 /**
  * Sends a withdrawal request to the Account Service to update an account's balance.
  * Assumes the Account Service has an endpoint like POST /accounts/{accountId}/withdraw.
  * @param accountId The ID of the account to withdraw from.
  * @param requestDto The WithdrawRequestDto containing the amount and transaction reference.
  * @return The updated AccountDto after the withdrawal.
  */
 @PostMapping("/{accountId}/withdraw")
 @CircuitBreaker(name = "accountService", fallbackMethod = "withdrawFundsFallback") // Added CircuitBreaker for consistency
 @Retry(name = "accountService") // Added Retry for consistency
 AccountDto withdrawFunds(@PathVariable("accountId") String accountId, @RequestBody WithdrawRequestDto requestDto);

 // Fallback method for withdrawFunds
 default AccountDto withdrawFundsFallback(String accountId, WithdrawRequestDto requestDto, Throwable t) {
     System.err.println("Fallback triggered for withdrawFunds from account " + accountId + ": " + t.getMessage());
     // Throw an exception as the withdrawal could not be processed by the real service
     throw new TransactionProcessingException("Account service is unavailable or failed to process withdrawal from account " + accountId, t);
 }
}
