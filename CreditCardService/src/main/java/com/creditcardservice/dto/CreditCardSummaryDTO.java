package com.creditcardservice.dto;

import com.creditcardservice.model.CardStatus;
import com.creditcardservice.model.CardType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreditCardSummaryDTO {
    private String cardId;
    private CardType cardType;
    private CardStatus status;
    private Double transactionLimit;
}
