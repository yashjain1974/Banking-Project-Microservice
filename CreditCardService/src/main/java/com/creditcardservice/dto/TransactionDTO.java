package com.creditcardservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a Transaction from the Transaction Microservice.
 * This should mirror the fields of the Transaction entity in the Transaction Service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private String transactionId;
    private String fromAccountId;
    private String toAccountId;
    private Double amount;
    private String type;    // Possible values: DEPOSIT, WITHDRAW, TRANSFER (as strings)
    private String status;  // Possible values: SUCCESS, FAILED, PENDING (as strings)
    private LocalDateTime transactionDate;
    // You might also include a cardId if the Transaction Service stores it directly
    // private String cardId;
}
