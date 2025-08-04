// src/app/shared/models/account.model.ts

// Enums mirroring backend Account.java
export enum AccountType {
    SAVINGS = 'SAVINGS',
    CURRENT = 'CURRENT',
}

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
    BLOCKED = 'BLOCKED',
}

// Interface mirroring backend AccountResponse DTO
export interface AccountResponse {
    accountId: string;
    userId: string;
    accountNumber: string;
    accountType: AccountType;
    balance: number; // Use number for Double from Java
    status: AccountStatus;
    createdAt: string; // Use string for LocalDateTime from Java
}

// Interface mirroring backend AccountCreationRequest DTO
export interface AccountCreationRequest {
    userId: string;
    accountType: AccountType;
    initialBalance: number;
}

// Interface mirroring backend AccountUpdateRequest DTO
export interface AccountUpdateRequest {
    status: AccountStatus;
}

// Interface mirroring backend DepositRequest DTO (for internal calls from Transaction Service)
// This is needed if AccountService frontend will directly call this endpoint for testing
export interface DepositRequest {
    transactionId: string;
    amount: number;
}

// Interface mirroring backend WithdrawRequest DTO (for internal calls from Transaction Service)
// This is needed if AccountService frontend will directly call this endpoint for testing
export interface WithdrawRequest {
    transactionId: string;
    amount: number;
}