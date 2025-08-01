package com.transaction.proxyService;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.transaction.dto.LoanDto; // DTO representing a Loan from the Loan Service

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

// @FeignClient annotation specifies the name of the target service (as registered in Eureka)
// The name "loan-service" should match the 'spring.application.name' in the Loan Service's application.yml
@FeignClient(name = "loan-service", path = "/loans")
public interface LoanServiceClient {

    /**
     * Retrieves loan details by loan ID from the Loan Service.
     * Corresponds to GET /loans/{loanId}
     * This method is called by the Transaction Service to verify loan details.
     *
     * @param loanId The ID of the loan to retrieve.
     * @return A LoanDto object containing the loan details.
     */
    @GetMapping("/{loanId}")
    @CircuitBreaker(name = "loanService", fallbackMethod = "getLoanByIdFallback")
    @Retry(name = "loanService")
    LoanDto getLoanById(@PathVariable("loanId") String loanId);

    /**
     * Fallback method for getLoanById.
     * This method is called when the primary call to the Loan Service fails.
     * It returns null, indicating that the loan could not be retrieved, allowing the
     * calling service (Transaction Service) to handle this scenario gracefully
     * (e.g., by throwing an `InvalidTransactionException`).
     *
     * @param loanId The ID of the loan that was being looked up.
     * @param t The Throwable that caused the fallback.
     * @return null, or you could return a default/mock LoanDto if appropriate for your business logic.
     */
    default LoanDto getLoanByIdFallback(String loanId, Throwable t) {
        System.err.println("Fallback triggered for getLoanById to loan " + loanId + ": " + t.getMessage());
        // Depending on business rules, you might:
        // 1. Return null (as done here), letting the calling service handle the "not found" scenario.
        // 2. Throw a specific exception (e.g., new TransactionProcessingException("Loan service unavailable.", t);)
        return null;
    }

    // Based on your LoanController, other GET endpoints are:
    // - getLoansByUser (GET /loans/user/{userId})
    // - getAllLoans (GET /loans)
    // - calculateEmi (GET /loans/{loanId}/emi)
    // If the Transaction Service or other services need to call these, you would add methods here.
    // However, for typical transaction processing, getLoanById is the most common query.
}
