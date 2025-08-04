// src/app/features/transactions/withdraw/withdraw.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service';
import { AccountResponse } from '../../../shared/models/account.model';
import { AuthService } from '../../../core/services/auth.service';
import { WithdrawRequest } from '../../../shared/models/transaction.model';


@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css']
})
export class WithdrawComponent implements OnInit {
  accounts: AccountResponse[] = [];
  withdrawForm = {
    accountId: '',
    amount: 0
  };

  
  loadingAccounts: boolean = true;
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
    this.loadingAccounts = true;
    this.errorMessage = null;

    const userId = this.authService.getIdentityClaims()?.sub;

    if (userId) {
      this.accountService.getAccountsByUserId(userId).subscribe(
        (data) => {
          this.accounts = data.filter(acc => acc.status === 'ACTIVE'); // Only active accounts
          this.loadingAccounts = false;
          if (this.accounts.length > 0) {
            this.withdrawForm.accountId = this.accounts[0].accountId; // Select first active account by default
          } else {
            this.errorMessage = 'No active accounts found to withdraw from.';
          }
        },
        (error) => {
          console.error('Error loading accounts for withdrawal:', error);
          this.errorMessage = error.error?.message || 'Failed to load accounts.';
          this.loadingAccounts = false;
        }
      );
    } else {
      this.errorMessage = 'User ID not found. Please log in again.';
      this.loadingAccounts = false;
    }
  }

  onSubmit(): void {
    const { accountId, amount } = this.withdrawForm;
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.withdrawForm.accountId) {
      this.errorMessage = 'Please select an account.';
      return;
    }
    if (this.withdrawForm.amount <= 0) {
      this.errorMessage = 'Withdrawal amount must be positive.';
      return;
    }

    const selectedAccount = this.accounts.find(acc => acc.accountId === this.withdrawForm.accountId);
    if (selectedAccount && selectedAccount.balance < this.withdrawForm.amount) {
      this.errorMessage = 'Insufficient funds in the selected account.';
      return;
    }

    const request: WithdrawRequest = {
      accountId: this.withdrawForm.accountId,
      amount: this.withdrawForm.amount
    };

    this.transactionService.withdrawFunds(request).subscribe(
      (response) => {
        this.successMessage = `Successfully withdrew ₹${response.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from account ending with ${response.fromAccountId?.slice(-4)}. Transaction ID: ${response.transactionId.slice(0, 8)}...`;
        this.resetForm();
        this.accountService.getAccountById(response.fromAccountId!).subscribe(
          acc => {
            const updatedAccount = this.accounts.find(a => a.accountId === acc.accountId);
            if (updatedAccount) updatedAccount.balance = acc.balance; // Update balance in local list
          }
        );
      },
      (error) => {
        console.error('Withdrawal failed:', error);
        this.errorMessage = error.error?.message || 'Withdrawal failed. Please try again.';
      }
    );
  }

  resetForm(): void {
    this.withdrawForm = {
      accountId: this.accounts.length > 0 ? this.accounts[0].accountId : '',
      amount: 0
    };
  }
}