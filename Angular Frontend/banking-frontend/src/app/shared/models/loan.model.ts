// Enums mirroring backend Loan.java
export enum LoanType {
    HOME = 'HOME',
    PERSONAL = 'PERSONAL',
    AUTO = 'AUTO', // Added from backend enum
    EDUCATION = 'EDUCATION',
    BUSINESS = 'BUSINESS',
}

export enum LoanStatus {
    APPROVED = 'APPROVED',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    DISBURSED = 'DISBURSED', // Added common status
    COMPLETED = 'COMPLETED', // Added common status
}

// Interface mirroring backend LoanResponseDto
export interface LoanResponse {
    loanId: string;
    userId: string;
    loanType: LoanType;
    amount: number;
    tenureInMonths: number;
    interestRate: number;
    status: LoanStatus;
    applicationDate: string; // Use string for LocalDateTime from Java
}

// Interface mirroring backend LoanRequestDto
export interface LoanRequest {
    userId: string;
    loanType: LoanType;
    amount: number;
    tenureInMonths: number;
    interestRate: number;
}
