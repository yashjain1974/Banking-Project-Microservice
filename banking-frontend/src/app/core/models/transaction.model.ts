export interface Transaction {
  transactionId: string;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  transactionDate: string;
}

export interface DepositRequest {
  accountId: string;
  amount: number;
}

export interface WithdrawRequest {
  accountId: string;
  amount: number;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}