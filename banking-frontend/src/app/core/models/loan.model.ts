export interface Loan {
  loanId: string;
  userId: string;
  loanType: LoanType;
  amount: number;
  tenureInMonths: number;
  interestRate: number;
  status: string;
  applicationDate: string;
}

export interface LoanRequest {
  userId: string;
  amount: number;
  tenureInMonths: number;
  interestRate: number;
  loanType: LoanType;
}

export enum LoanType {
  HOME = 'HOME',
  PERSONAL = 'PERSONAL',
  AUTO = 'AUTO',
  EDUCATION = 'EDUCATION',
  BUSINESS = 'BUSINESS'
}