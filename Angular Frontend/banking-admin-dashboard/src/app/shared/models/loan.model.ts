// src/app/shared/models/loan.model.ts

export enum LoanType {
    HOME = 'HOME',
    PERSONAL = 'PERSONAL',
    EDUCATION = 'EDUCATION',
}

export enum LoanStatus {
    APPROVED = 'APPROVED',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
}

// Interface mirroring backend LoanResponseDto
export interface LoanResponse {
    loanId: string;
    userId: string;
    loanType: LoanType;
    amount: number;
    tenureMonths: number; // Corrected to number
    interestRate: number;
    status: LoanStatus;
    applicationDate: string; // Use string for LocalDateTime from Java
}

// Interface mirroring backend LoanRequestDto (if admin dashboard needs to apply for loans - less common)
export interface LoanRequest {
    userId: string;
    loanType: LoanType;
    amount: number;
    tenureMonths: number;
    interestRate: number;
}