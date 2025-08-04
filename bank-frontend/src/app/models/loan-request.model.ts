import { LoanType } from "./loan-type.enum";

export interface LoanRequest {
  userId: string;
  loanType: LoanType; // use an enum if needed
  amount: number;
  interestRate: number;
  tenureInMonths: number;
}
