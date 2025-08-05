package com.creditcardservice.dto;

import com.creditcardservice.model.CardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardRequestDTO {

    @NotBlank(message = "User ID cannot be blank")
    private String userId;

    @NotBlank(message = "Account ID cannot be blank")
    private String accountId;

    @NotNull(message = "Card type is required")
    private CardType cardType;

    @NotNull(message = "Transaction limit is required")
    private Double transactionLimit;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    private String cardNumber;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;
}
