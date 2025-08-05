// src/app/shared/models/card.model.ts

// Enums mirroring backend CreditCard.java
export enum CardType {
    VISA = 'VISA',
    MASTERCARD = 'MASTERCARD',
    AMERICAN_EXPRESS = 'AMERICAN_EXPRESS',
    DISCOVER = 'DISCOVER',
    RUPAY = 'RUPAY',
}

export enum CardStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED',
    // Add other statuses like EXPIRED, CANCELLED if applicable
}

// Interface mirroring backend CreditCardResponseDTO
export interface CardResponse {
    cardId: string;
    userId: string;
    accountId: string;
    cardNumber: string;
    cardType: CardType;
    issueDate: string; // Use string for LocalDate from Java
    expiryDate: string; // Use string for LocalDate from Java
    status: CardStatus;
    transactionLimit: number;
    createdAt: string; // Use string for LocalDateTime from Java
}

// Interface mirroring backend CreditCardRequestDTO
export interface CardRequest {
    userId: string;
    accountId: string;
    cardType: CardType;
    issueDate: string; // Send as 'YYYY-MM-DD' string
    expiryDate: string; // Send as 'YYYY-MM-DD' string
    transactionLimit: number;
}