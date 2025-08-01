package com.creditcardservice.dto;

import com.creditcardservice.model.CardStatus;
import com.creditcardservice.model.CardType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CreditCardResponseDTO {
    private String cardId;
    private String userId;
    private String accountId;
    private String cardNumber;
    private CardType cardType;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private CardStatus status;
    private Double transactionLimit;
    private LocalDateTime createdAt;
}
