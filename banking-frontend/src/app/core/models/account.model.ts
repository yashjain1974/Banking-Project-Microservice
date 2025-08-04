export interface Account {
  accountId: string;
  userId: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  status: AccountStatus;
  createdAt: string;
}

export interface AccountCreationRequest {
  userId: string;
  accountType: AccountType;
  initialBalance: number;
}

export interface AccountUpdateRequest {
  status: AccountStatus;
}

export interface DepositRequest {
  accountId: string;
  amount: number;
}

export interface WithdrawRequest {
  accountId: string;
  amount: number;
}

export enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED'
}