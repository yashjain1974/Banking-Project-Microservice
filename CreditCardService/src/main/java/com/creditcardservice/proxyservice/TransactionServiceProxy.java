package com.creditcardservice.proxyservice;

import com.creditcardservice.dto.TransactionDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Collections;
import java.util.List;

@FeignClient(name = "transaction-service", url = "${transaction.service.url}")
public interface TransactionServiceProxy {

    @GetMapping("/transactions/card/{cardId}")
    @CircuitBreaker(name = "transactionService", fallbackMethod = "getFallbackTransactions")
    List<TransactionDTO> getTransactionsByCardId(@PathVariable("cardId") String cardId);

    default List<TransactionDTO> getFallbackTransactions(String cardId, Throwable t) {
        System.out.println("Fallback triggered: " + t.getMessage());
        return Collections.emptyList(); // or throw a custom exception
    }
}
