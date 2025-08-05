import { LoanStatus } from "./loan-status.enum";

export interface LoanResponse {
  loanId: string;
  userId: string;
  loanType: string;
  amount: number;
  interestRate: number;
  tenureInMonths: number;
  emi: number;
  status: LoanStatus;
}
