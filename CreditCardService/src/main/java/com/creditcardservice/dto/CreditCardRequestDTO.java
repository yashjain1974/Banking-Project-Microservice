package com.creditcardservice.dto;

import com.creditcardservice.model.CardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreditCardRequestDTO {
    @NotBlank
    private String userId;

    @NotBlank
    private String accountId;

    @NotNull
    private CardType cardType;

    @NotNull
    private Double transactionLimit;

    @NotNull
    private LocalDate issueDate;

    @NotNull
    private String cardNumber;

    @NotBlank
    private LocalDate expiryDate;

}
