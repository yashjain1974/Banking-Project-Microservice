// src/app/features/transactions/transfer/transfer.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service'; // To get user's accounts
import { AccountResponse } from '../../../shared/models/account.model';
import { AuthService } from '../../../core/services/auth.service';
import { TransferRequest } from '../../../shared/models/transaction.model';


@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  accounts: AccountResponse[] = [];
  transferForm = {
    fromAccountId: '', // This will store the accountId for dropdown selection
    fromAccountNumber: '', // This will be sent to backend
    toAccountNumber: '', // This will be sent to backend
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
            this.transferForm.fromAccountId = this.accounts[0].accountId; // Select first active account by default
            this.transferForm.fromAccountNumber = this.accounts[0].accountNumber; // Set corresponding account number
          } else {
            this.errorMessage = 'No active accounts found to transfer from.';
          }
        },
        (error) => {
          console.error('Error loading accounts for transfer:', error);
          this.errorMessage = error.error?.message || 'Failed to load accounts.';
          this.loadingAccounts = false;
        }
      );
    } else {
      this.errorMessage = 'User ID not found. Please log in again.';
      this.loadingAccounts = false;
    }
  }

  // Update fromAccountNumber when fromAccountId selection changes
  onFromAccountChange(): void {
    const selectedAccount = this.accounts.find(acc => acc.accountId === this.transferForm.fromAccountId);
    if (selectedAccount) {
      this.transferForm.fromAccountNumber = selectedAccount.accountNumber;
    }
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.transferForm.fromAccountId || !this.transferForm.toAccountNumber) {
      this.errorMessage = 'Please select your account and enter recipient\'s account number.';
      return;
    }
    if (this.transferForm.fromAccountNumber === this.transferForm.toAccountNumber) {
      this.errorMessage = 'Cannot transfer funds to the same account.';
      return;
    }
    if (this.transferForm.amount <= 0) {
      this.errorMessage = 'Transfer amount must be positive.';
      return;
    }

    const selectedFromAccount = this.accounts.find(acc => acc.accountId === this.transferForm.fromAccountId);
    if (selectedFromAccount && selectedFromAccount.balance < this.transferForm.amount) {
      this.errorMessage = 'Insufficient funds in the source account.';
      return;
    }

    const request: TransferRequest = {
      fromAccountNumber: this.transferForm.fromAccountNumber,
      toAccountNumber: this.transferForm.toAccountNumber,
      amount: this.transferForm.amount
    };

    this.transactionService.transferFunds(request).subscribe(
      (response) => {
        this.successMessage = `Successfully transferred ₹${response.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from account ending with ${response.fromAccountId?.slice(-4)} to ${response.toAccountId?.slice(-4)}. Transaction ID: ${response.transactionId.slice(0, 8)}...`;
        this.resetForm();
        // Update balances in local list for both accounts
        this.accountService.getAccountById(response.fromAccountId!).subscribe(
          acc => {
            const updatedAccount = this.accounts.find(a => a.accountId === acc.accountId);
            if (updatedAccount) updatedAccount.balance = acc.balance;
          }
        );
        // Note: For toAccountId, you might need to fetch the account by number if it's not the current user's account
        // For simplicity, we're not updating the recipient's balance in the local list here unless it's also the current user's.
        // A full solution might involve refreshing all user accounts.
      },
      (error) => {
        console.error('Transfer failed:', error);
        this.errorMessage = error.error?.message || 'Transfer failed. Please try again.';
      }
    );
  }

  resetForm(): void {
    this.transferForm = {
      fromAccountId: this.accounts.length > 0 ? this.accounts[0].accountId : '',
      fromAccountNumber: this.accounts.length > 0 ? this.accounts[0].accountNumber : '',
      toAccountNumber: '',
      amount: 0
    };
  }
}