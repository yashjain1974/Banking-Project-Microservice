package com.transaction.event;

import java.io.Serializable; // Good practice for Kafka events

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionCompletedEvent implements Serializable { // Implement Serializable

    private static final long serialVersionUID = 1L; // For Serializable

    private String transactionId;
    private String userId; // User who initiated/is affected by the transaction
    private String accountId; // Account affected (fromAccountId or toAccountId)
    private Double amount;
    private String type; // e.g., DEPOSIT, WITHDRAW, TRANSFER
    private String status; // e.g., SUCCESS, FAILED
    private String notificationMessage; // The message content for the notification
}
