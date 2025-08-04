// src/app/shared/models/transaction.model.ts

// Enums mirroring backend Transaction.java
export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAW = 'WITHDRAW',
    TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
}

// Interface mirroring backend Transaction entity/response DTO
export interface TransactionResponse {
    transactionId: string;
    fromAccountId: string | null; // Can be null for DEPOSIT
    toAccountId: string | null;   // Can be null for WITHDRAW
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
    transactionDate: string; // Use string for LocalDateTime from Java
}

// Interface mirroring backend DepositRequest DTO
export interface DepositRequest {
    accountId: string;
    amount: number;
}

// Interface mirroring backend WithdrawRequest DTO
export interface WithdrawRequest {
    accountId: string;
    amount: number;
}

// Interface mirroring backend TransferRequest DTO
export interface TransferRequest {
    fromAccountNumber: string; // Changed from fromAccountId
    toAccountNumber: string;   // Changed from toAccountId
    amount: number;
}