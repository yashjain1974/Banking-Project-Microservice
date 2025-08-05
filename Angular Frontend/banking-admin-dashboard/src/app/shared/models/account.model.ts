// banking-admin-dashboard/src/app/shared/models/account.model.ts

// Enums mirroring backend Account.java
export enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  BLOCKED = 'BLOCKED', // Ensure BLOCKED is here for admin actions
}

// Interface mirroring backend AccountResponse DTO
export interface AccountResponse {
  accountId: string;
  userId: string;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  status: AccountStatus;
  createdAt: string;
}

// Interface mirroring backend AccountUpdateRequest DTO
export interface AccountUpdateRequest {
  status: AccountStatus;
}