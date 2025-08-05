import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For dropdown selection
import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service'; // To get user's accounts
import { AccountResponse } from '../../../shared/models/account.model';
import { TransactionResponse, TransactionStatus, TransactionType } from '../../../shared/models/transaction.model';
import { AuthService } from '../../../core/services/auth.service';





@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {
  accounts: AccountResponse[] = [];
  selectedAccountId: string | null = null;
  transactions: TransactionResponse[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserAccounts();
  }

  loadUserAccounts(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const userId = this.authService.getIdentityClaims()?.sub;

    if (userId) {
      this.accountService.getAccountsByUserId(userId).subscribe(
        (data) => {
          this.accounts = data || []; // FIX: Assign data, or an empty array if data is null/undefined
          this.loading = false;
          if (this.accounts.length > 0) {
            this.selectedAccountId = this.accounts[0].accountId; // Select first account by default
            this.onAccountChange(); // Load transactions for the default account
          } else {
            this.successMessage = 'No accounts found to display transaction history.';
          }
        },
        (error) => {
          console.error('Error loading accounts for history:', error);
          this.errorMessage = error.error?.message || 'Failed to load accounts for history.';
          this.loading = false;
        }
      );
    } else {
      this.errorMessage = 'User ID not found. Please log in again.';
      this.loading = false;
    }
  }

  onAccountChange(): void {
    if (this.selectedAccountId) {
      this.loading = true;
      this.errorMessage = null;
      this.successMessage = null;
      this.transactions = []; // Clear previous transactions

      this.transactionService.getTransactionsByAccountId(this.selectedAccountId).subscribe(
        (data) => {
          this.transactions = data || []; // FIX: Assign data, or an empty array if data is null/undefined
          this.loading = false;
          if (this.transactions.length === 0) {
            this.successMessage = 'No transactions found for this account.';
          }
        },
        (error) => {
          console.error('Error loading transactions:', error);
          this.errorMessage = error.error?.message || 'Failed to load transactions.';
          this.loading = false;
        }
      );
    } else {
      this.transactions = [];
      this.successMessage = 'Please select an account.';
    }
  }

  getTransactionStatusClass(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.SUCCESS: return 'status-success';
      case TransactionStatus.FAILED: return 'status-failed';
      case TransactionStatus.PENDING: return 'status-pending';
      default: return '';
    }
  }

  getTransactionTypeClass(type: TransactionType): string {
    switch (type) {
      case TransactionType.DEPOSIT: return 'type-deposit';
      case TransactionType.WITHDRAW: return 'type-withdraw';
      case TransactionType.TRANSFER: return 'type-transfer';
      default: return '';
    }
  }
  getAccountDisplayName(accountId: string | null): string {
    if (!accountId) return '-';

    const account = this.accounts.find(acc => acc.accountId === accountId);
    if (account) return account.accountNumber;

    return accountId.slice(0, 8) + '...';
  }
  getSelectedAccountNumber(): string {
    const account = this.accounts.find(acc => acc.accountId === this.selectedAccountId);
    return account ? account.accountNumber : '';
  }
}
