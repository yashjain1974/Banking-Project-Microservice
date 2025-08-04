import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import { Account, AccountStatus } from '../../../core/models/account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="accounts-container">
      <div class="header">
        <h1>My Accounts</h1>
        <button mat-raised-button color="primary" routerLink="/accounts/create">
          <mat-icon>add</mat-icon>
          Open New Account
        </button>
      </div>
      
      <div class="accounts-grid" *ngIf="accounts.length > 0; else noAccounts">
        <mat-card class="account-card" *ngFor="let account of accounts">
          <mat-card-header>
            <div class="account-header">
              <div class="account-info">
                <h3>{{account.accountType}} Account</h3>
                <p class="account-number">{{account.accountNumber}}</p>
              </div>
              <mat-chip [class]="getStatusClass(account.status)">
                {{account.status}}
              </mat-chip>
            </div>
          </mat-card-header>
          
          <mat-card-content>
            <div class="balance-section">
              <p class="balance-label">Available Balance</p>
              <p class="balance-amount">₹{{account.balance | number:'1.2-2'}}</p>
            </div>
            
            <div class="account-details">
              <p><strong>Account ID:</strong> {{account.accountId}}</p>
              <p><strong>Created:</strong> {{account.createdAt | date:'mediumDate'}}</p>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button routerLink="/accounts/{{account.accountId}}">
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
            <button mat-button routerLink="/transactions/transfer" 
                    [queryParams]="{fromAccount: account.accountId}">
              <mat-icon>send</mat-icon>
              Transfer
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <ng-template #noAccounts>
        <mat-card class="no-accounts-card">
          <mat-card-content>
            <div class="no-accounts-content">
              <mat-icon class="no-accounts-icon">account_balance</mat-icon>
              <h2>No Accounts Found</h2>
              <p>You don't have any bank accounts yet. Open your first account to get started!</p>
              <button mat-raised-button color="primary" routerLink="/accounts/create">
                <mat-icon>add</mat-icon>
                Open Your First Account
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .accounts-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    
    .account-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .account-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }
    
    .account-info h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .account-number {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #666;
      font-family: monospace;
    }
    
    .balance-section {
      margin: 16px 0;
      padding: 16px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 8px;
    }
    
    .balance-label {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    
    .balance-amount {
      margin: 4px 0 0 0;
      font-size: 28px;
      font-weight: 700;
      color: #2e7d32;
    }
    
    .account-details p {
      margin: 8px 0;
      font-size: 14px;
      color: #666;
    }
    
    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .status-closed {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .no-accounts-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .no-accounts-content {
      text-align: center;
      padding: 48px 24px;
    }
    
    .no-accounts-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .no-accounts-content h2 {
      color: #333;
      margin-bottom: 16px;
    }
    
    .no-accounts-content p {
      color: #666;
      margin-bottom: 24px;
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .accounts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  currentUser: any;

  constructor(
    private accountService: AccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadAccounts(user.userId);
      }
    });
  }

  private loadAccounts(userId: string): void {
    this.accountService.getAccountsByUserId(userId).subscribe({
      next: (accounts) => this.accounts = accounts,
      error: (error) => console.error('Failed to load accounts:', error)
    });
  }

  getStatusClass(status: AccountStatus): string {
    return `status-${status.toLowerCase()}`;
  }
}