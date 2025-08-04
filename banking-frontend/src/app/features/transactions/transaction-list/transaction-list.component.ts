import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import { Transaction } from '../../../core/models/transaction.model';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule
  ],
  template: `
    <div class="transactions-container">
      <div class="header">
        <h1>Transactions</h1>
        <div class="action-buttons">
          <button mat-raised-button color="primary" routerLink="/transactions/transfer">
            <mat-icon>swap_horiz</mat-icon>
            Transfer
          </button>
          <button mat-raised-button color="accent" routerLink="/transactions/deposit">
            <mat-icon>add</mat-icon>
            Deposit
          </button>
          <button mat-raised-button routerLink="/transactions/withdraw">
            <mat-icon>remove</mat-icon>
            Withdraw
          </button>
        </div>
      </div>
      
      <mat-tab-group *ngIf="accounts.length > 0">
        <mat-tab *ngFor="let account of accounts" [label]="getAccountLabel(account)">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <div class="account-header">
                  <div>
                    <mat-card-title>{{account.accountType}} Account</mat-card-title>
                    <mat-card-subtitle>{{account.accountNumber}}</mat-card-subtitle>
                  </div>
                  <div class="account-balance">
                    <span class="balance-label">Balance:</span>
                    <span class="balance-amount">₹{{account.balance | number:'1.2-2'}}</span>
                  </div>
                </div>
              </mat-card-header>
              
              <mat-card-content>
                <div class="transactions-table" *ngIf="getAccountTransactions(account.accountId).length > 0; else noTransactions">
                  <table mat-table [dataSource]="getAccountTransactions(account.accountId)" class="full-width">
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date & Time</th>
                      <td mat-cell *matCellDef="let transaction">
                        {{transaction.transactionDate | date:'short'}}
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let transaction">
                        <div class="transaction-type">
                          <mat-icon [class]="getTransactionIconClass(transaction.type)">
                            {{getTransactionIcon(transaction.type)}}
                          </mat-icon>
                          {{transaction.type}}
                        </div>
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="description">
                      <th mat-header-cell *matHeaderCellDef>Description</th>
                      <td mat-cell *matCellDef="let transaction">
                        {{getTransactionDescription(transaction, account.accountId)}}
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let transaction">
                        <span [class]="getAmountClass(transaction, account.accountId)">
                          {{getAmountPrefix(transaction, account.accountId)}}₹{{transaction.amount | number:'1.2-2'}}
                        </span>
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let transaction">
                        <mat-chip [class]="getStatusClass(transaction.status)">
                          {{transaction.status}}
                        </mat-chip>
                      </td>
                    </ng-container>
                    
                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>
                </div>
                
                <ng-template #noTransactions>
                  <div class="no-transactions">
                    <mat-icon>receipt_long</mat-icon>
                    <h3>No Transactions</h3>
                    <p>No transactions found for this account.</p>
                  </div>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
      
      <mat-card *ngIf="accounts.length === 0" class="no-accounts-card">
        <mat-card-content>
          <div class="no-accounts">
            <mat-icon>account_balance</mat-icon>
            <h2>No Accounts Found</h2>
            <p>You need to have at least one account to view transactions.</p>
            <button mat-raised-button color="primary" routerLink="/accounts/create">
              <mat-icon>add</mat-icon>
              Open Account
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .transactions-container {
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
    
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    
    .tab-content {
      padding: 24px 0;
    }
    
    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .account-balance {
      text-align: right;
    }
    
    .balance-label {
      font-size: 14px;
      color: #666;
    }
    
    .balance-amount {
      font-size: 20px;
      font-weight: 600;
      color: #2e7d32;
      margin-left: 8px;
    }
    
    .transactions-table {
      width: 100%;
    }
    
    .transaction-type {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .transaction-type mat-icon.deposit {
      color: #4CAF50;
    }
    
    .transaction-type mat-icon.withdraw {
      color: #f44336;
    }
    
    .transaction-type mat-icon.transfer {
      color: #2196F3;
    }
    
    .amount-positive {
      color: #4CAF50;
      font-weight: 600;
    }
    
    .amount-negative {
      color: #f44336;
      font-weight: 600;
    }
    
    .status-success {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .status-failed {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }
    
    .no-transactions,
    .no-accounts {
      text-align: center;
      padding: 48px;
      color: #666;
    }
    
    .no-transactions mat-icon,
    .no-accounts mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .action-buttons {
        justify-content: center;
      }
      
      .account-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
      
      .account-balance {
        text-align: left;
      }
    }
  `]
})
export class TransactionListComponent implements OnInit {
  accounts: Account[] = [];
  allTransactions: Transaction[] = [];
  displayedColumns: string[] = ['date', 'type', 'description', 'amount', 'status'];

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadAccounts(user.userId);
      }
    });
  }

  private loadAccounts(userId: string): void {
    this.accountService.getAccountsByUserId(userId).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loadAllTransactions();
      },
      error: () => console.error('Failed to load accounts')
    });
  }

  private loadAllTransactions(): void {
    this.accounts.forEach(account => {
      this.transactionService.getTransactionsByAccountId(account.accountId).subscribe({
        next: (transactions) => {
          this.allTransactions = [...this.allTransactions, ...transactions];
        },
        error: () => console.error('Failed to load transactions for account:', account.accountId)
      });
    });
  }

  getAccountLabel(account: Account): string {
    return `${account.accountType} - ${account.accountNumber}`;
  }

  getAccountTransactions(accountId: string): Transaction[] {
    return this.allTransactions
      .filter(t => t.fromAccountId === accountId || t.toAccountId === accountId)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'DEPOSIT': return 'arrow_downward';
      case 'WITHDRAW': return 'arrow_upward';
      case 'TRANSFER': return 'swap_horiz';
      default: return 'swap_horiz';
    }
  }

  getTransactionIconClass(type: string): string {
    return type.toLowerCase();
  }

  getTransactionDescription(transaction: Transaction, accountId: string): string {
    switch (transaction.type) {
      case 'DEPOSIT':
        return 'Money deposited to account';
      case 'WITHDRAW':
        return 'Money withdrawn from account';
      case 'TRANSFER':
        if (transaction.fromAccountId === accountId) {
          return `Transfer to ${transaction.toAccountId}`;
        } else {
          return `Transfer from ${transaction.fromAccountId}`;
        }
      default:
        return 'Transaction';
    }
  }

  getAmountClass(transaction: Transaction, accountId: string): string {
    if (transaction.type === 'DEPOSIT' || 
        (transaction.type === 'TRANSFER' && transaction.toAccountId === accountId)) {
      return 'amount-positive';
    }
    return 'amount-negative';
  }

  getAmountPrefix(transaction: Transaction, accountId: string): string {
    if (transaction.type === 'DEPOSIT' || 
        (transaction.type === 'TRANSFER' && transaction.toAccountId === accountId)) {
      return '+';
    }
    return '-';
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}