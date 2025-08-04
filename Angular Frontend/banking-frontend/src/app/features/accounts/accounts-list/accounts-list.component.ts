// src/app/features/accounts/accounts-list/accounts-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf, ngFor
import { FormsModule } from '@angular/forms'; // For ngModel (if using forms for creation/updates)
import { AccountService } from '../account.service'; // Import AccountService
// Import AuthService

import { UserProfileService, UserProfile } from '../../user-profile/user-profile.service'; // Import UserProfileService
import { AuthService } from '../../../core/services/auth.service';
import { AccountCreationRequest, AccountResponse, AccountStatus, AccountType } from '../../../shared/models/account.model';


@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // Include FormsModule for form interactions
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.css']
})
export class AccountsListComponent implements OnInit {
  accounts: AccountResponse[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // For new account creation form
  newAccount: AccountCreationRequest = {
    userId: '', // Will be populated from logged-in user
    accountType: AccountType.SAVINGS, // Default type
    initialBalance: 0
  };
  accountTypes = Object.values(AccountType); // For dropdown

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private userProfileService: UserProfileService // Inject UserProfileService to get current user's ID
  ) { }

  ngOnInit(): void {
    this.loadUserAccounts();
  }

  loadUserAccounts(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const userId = this.authService.getIdentityClaims()?.sub; // Get user ID from JWT

    if (userId) {
      this.accountService.getAccountsByUserId(userId).subscribe(
        (data) => {
          this.accounts = data;
          this.loading = false;
          if (this.accounts.length === 0) {
            this.successMessage = 'You have no accounts yet. Create one!';
          }
        },
        (error) => {
          console.error('Error loading accounts:', error);
          this.errorMessage = error.error?.message || 'Failed to load accounts.';
          this.loading = false;
        }
      );
    } else {
      this.errorMessage = 'User ID not found. Please log in again.';
      this.loading = false;
    }
  }

  createAccount(): void {
    this.errorMessage = null;
    this.successMessage = null;
    const userId = this.authService.getIdentityClaims()?.sub;

    if (!userId) {
      this.errorMessage = 'User not logged in. Cannot create account.';
      return;
    }

    this.newAccount.userId = userId; // Assign logged-in user's ID

    this.accountService.createAccount(this.newAccount).subscribe(
      (response) => {
        this.successMessage = `Account ${response.accountNumber} created successfully!`;
        this.loadUserAccounts(); // Reload accounts list
        // Reset form
        this.newAccount = { userId: userId, accountType: AccountType.SAVINGS, initialBalance: 0 };
      },
      (error) => {
        console.error('Error creating account:', error);
        this.errorMessage = error.error?.message || 'Failed to create account.';
      }
    );
  }

  blockAccount(accountId: string): void {
    if (confirm(`Are you sure you want to BLOCK account ${accountId}?`)) {
      this.accountService.updateAccountStatus(accountId, AccountStatus.CLOSED).subscribe(
        (response) => {
          this.successMessage = `Account ${response.accountNumber} blocked successfully.`;
          this.loadUserAccounts();
        },
        (error) => {
          console.error('Error blocking account:', error);
          this.errorMessage = error.error?.message || 'Failed to block account.';
        }
      );
    }
  }

  unblockAccount(accountId: string): void {
    if (confirm(`Are you sure you want to UNBLOCK account ${accountId}?`)) {
      this.accountService.updateAccountStatus(accountId, AccountStatus.ACTIVE).subscribe(
        (response) => {
          this.successMessage = `Account ${response.accountNumber} unblocked successfully.`;
          this.loadUserAccounts();
        },
        (error) => {
          console.error('Error unblocking account:', error);
          this.errorMessage = error.error?.message || 'Failed to unblock account.';
        }
      );
    }
  }

  deleteAccount(accountId: string): void {
    if (confirm(`Are you sure you want to DELETE account ${accountId}? This action cannot be undone.`)) {
      this.accountService.deleteAccount(accountId).subscribe(
        () => {
          this.successMessage = `Account ${accountId} deleted successfully.`;
          this.loadUserAccounts();
        },
        (error) => {
          console.error('Error deleting account:', error);
          this.errorMessage = error.error?.message || 'Failed to delete account.';
        }
      );
    }
  }

  getAccountStatusClass(status: AccountStatus): string {
    switch (status) {
      case AccountStatus.ACTIVE: return 'status-active';
      case AccountStatus.CLOSED: return 'status-closed';
      default: return '';
    }
  }
}