// banking-admin-dashboard/src/app/features/account-management/account-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel
import { AccountResponse, AccountStatus } from '../../../shared/models/account.model';
import { AccountService } from '../account.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { UserProfileService } from '../../user-management/user-profile/user-profile.service';
import { RouterLink } from '@angular/router';




@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-management.component.html',
  styleUrls: ['./account-management.component.css']
})
export class AccountManagementComponent implements OnInit {
  searchQuery: string = '';
  searchType: 'userId' | 'accountId' | 'accountNumber' = 'userId'; // Default search type
  foundAccounts: AccountResponse[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  AccountStatus = AccountStatus; // For template access

  constructor(
    private accountService: AccountService,
    private authService: AuthService, // For logout
    private userProfileService: UserProfileService // To display username for userId search
  ) { }

  ngOnInit(): void {
    // Optionally load all accounts or prompt for search
  }

  onSearch(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.foundAccounts = []; // Clear previous results

    if (!this.searchQuery.trim()) {
      this.errorMessage = 'Please enter a search query.';
      this.loading = false;
      return;
    }

    let searchObservable: Observable<AccountResponse[]>;

    if (this.searchType === 'userId') {
      searchObservable = this.accountService.getAccountsByUserId(this.searchQuery);
      searchObservable.subscribe(
        (data: AccountResponse[]) => {
          this.foundAccounts = data;
          this.loading = false;
          if (this.foundAccounts.length === 0) {
            this.successMessage = 'No accounts found for this User ID.';
          }
        },
        (error) => {
          console.error('Error searching by User ID:', error);
          this.errorMessage = error.error?.message || 'Failed to search accounts by User ID.';
          this.loading = false;
        }
      );
    } else if (this.searchType === 'accountId') {
      this.accountService.getAccountById(this.searchQuery).subscribe(
        (data: AccountResponse) => {
          this.foundAccounts = [data]; // Wrap single account in an array
          this.loading = false;
        },
        (error) => {
          console.error('Error searching by Account ID:', error);
          this.errorMessage = error.error?.message || 'Failed to search account by ID.';
          this.loading = false;
        }
      );
    } else if (this.searchType === 'accountNumber') {
      this.accountService.getAccountByAccountNumber(this.searchQuery).subscribe(
        (data: AccountResponse) => {
          this.foundAccounts = [data]; // Wrap single account in an array
          this.loading = false;
        },
        (error) => {
          console.error('Error searching by Account Number:', error);
          this.errorMessage = error.error?.message || 'Failed to search account by number.';
          this.loading = false;
        }
      );
    }
  }

  updateAccountStatus(accountId: string, newStatus: AccountStatus): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (confirm(`Are you sure you want to change status of account ${accountId} to ${newStatus}?`)) {
      this.accountService.updateAccountStatus(accountId, newStatus).subscribe(
        (updatedAccount) => {
          this.successMessage = `Account ${updatedAccount.accountNumber} status updated to ${updatedAccount.status}.`;
          // Update the status in the local list
          const index = this.foundAccounts.findIndex(acc => acc.accountId === accountId);
          if (index !== -1) {
            this.foundAccounts[index].status = updatedAccount.status;
          }
        },
        (error) => {
          console.error(`Error updating status for account ${accountId}:`, error);
          this.errorMessage = error.error?.message || `Failed to update status for account ${accountId}.`;
        }
      );
    }
  }

  deleteAccount(accountId: string): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (confirm(`Are you sure you want to DELETE account ${accountId}? This action cannot be undone.`)) {
      this.accountService.deleteAccount(accountId).subscribe(
        () => {
          this.successMessage = `Account ${accountId} deleted successfully.`;
          this.foundAccounts = this.foundAccounts.filter(acc => acc.accountId !== accountId); // Remove from list
        },
        (error) => {
          console.error(`Error deleting account ${accountId}:`, error);
          this.errorMessage = error.error?.message || `Failed to delete account ${accountId}.`;
        }
      );
    }
  }

  getAccountStatusClass(status: AccountStatus): string {
    switch (status) {
      case AccountStatus.ACTIVE: return 'status-active';
      case AccountStatus.CLOSED: return 'status-closed';
      case AccountStatus.BLOCKED: return 'status-blocked';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}