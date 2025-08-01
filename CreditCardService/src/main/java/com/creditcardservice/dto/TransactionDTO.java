package com.creditcardservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private String transactionId;
    private String cardId;
    private Double amount;
    private String merchant;
    private LocalDateTime timestamp;
}
