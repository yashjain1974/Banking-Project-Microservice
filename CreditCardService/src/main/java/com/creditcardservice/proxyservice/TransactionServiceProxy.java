package com.creditcardservice.proxyservice;

import java.util.Collections;
import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.creditcardservice.dto.TransactionDTO; // DTO representing a Transaction from the Transaction Service

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

/**
 * Feign Client for interacting with the Transaction Microservice.
 * The 'name' should match the 'spring.application.name' of the Transaction Service (e.g., "transaction").
 * The 'path' should match the base path of the Transaction Service's API (e.g., "/transactions").
 */
@FeignClient(name = "transaction", path = "/transactions")
public interface TransactionServiceProxy {

    /**
     * Retrieves transactions associated with a specific card ID from the Transaction Service.
     * Corresponds to GET /transactions/card/{cardId} (assuming Transaction Service exposes this)
     *
     * @param cardId The ID of the card to retrieve transactions for.
     * @return A list of TransactionDTOs.
     */
    @GetMapping("/card/{cardId}") // Assuming Transaction Service has an endpoint to get transactions by cardId
    @CircuitBreaker(name = "transactionService", fallbackMethod = "getTransactionsByCardIdFallback")
    @Retry(name = "transactionService")
    List<TransactionDTO> getTransactionsByCardId(@PathVariable("cardId") String cardId);

    /**
     * Fallback method for getTransactionsByCardId.
     * Returns an empty list when the Transaction Service is unavailable or the call fails.
     *
     * @param cardId The ID of the card.
     * @param t The Throwable that caused the fallback.
     * @return An empty list of TransactionDTOs.
     */
    default List<TransactionDTO> getTransactionsByCardIdFallback(String cardId, Throwable t) {
        System.err.println("Fallback triggered for getTransactionsByCardId for card " + cardId + ": " + t.getMessage());
        return Collections.emptyList(); // Return empty list gracefully
    }
}
