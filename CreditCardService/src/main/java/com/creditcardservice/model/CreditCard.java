package com.creditcardservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class CreditCard {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String cardId;
    private String userId;
    private String accountId;
    
    @Column(unique = true,nullable = false)
    private String cardNumber;

    @Enumerated(EnumType.STRING)
    private CardType cardType;  //Enum // Possible values: DEBIT, CREDIT
    private LocalDate issueDate;
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private CardStatus status; //Enum  // Possible values: ACTIVE, BLOCKED
    private Double transactionLimit;
    private LocalDateTime createdAt;
}
