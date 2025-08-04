// src/app/features/transactions/deposit/deposit.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service'; // To get user's accounts
import { AccountResponse } from '../../../shared/models/account.model';
import { AuthService } from '../../../core/services/auth.service';
import { DepositRequest } from '../../../shared/models/transaction.model';


@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {
  accounts: AccountResponse[] = [];
  depositForm = {
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
            this.depositForm.accountId = this.accounts[0].accountId; // Select first active account by default
          } else {
            this.errorMessage = 'No active accounts found to deposit into.';
          }
        },
        (error) => {
          console.error('Error loading accounts for deposit:', error);
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
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.depositForm.accountId) {
      this.errorMessage = 'Please select an account.';
      return;
    }
    if (this.depositForm.amount <= 0) {
      this.errorMessage = 'Deposit amount must be positive.';
      return;
    }

    const request: DepositRequest = {
      accountId: this.depositForm.accountId,
      amount: this.depositForm.amount
    };

    this.transactionService.depositFunds(request).subscribe(
      (response) => {
        this.successMessage =
          `Successfully deposited ₹${response.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} into account ending with ${response.toAccountId?.slice(-4)}. Transaction ID: ${response.transactionId.slice(0, 8)}...`;
        this.resetForm();
        this.accountService.getAccountById(response.toAccountId!).subscribe(
          acc => {
            const updatedAccount = this.accounts.find(a => a.accountId === acc.accountId);
            if (updatedAccount) updatedAccount.balance = acc.balance; // Update balance in local list
          }
        );
      },
      (error) => {
        console.error('Deposit failed:', error);
        this.errorMessage = error.error?.message || 'Deposit failed. Please try again.';
      }
    );
  }

  resetForm(): void {
    this.depositForm = {
      accountId: this.accounts.length > 0 ? this.accounts[0].accountId : '',
      amount: 0
    };
  }
}