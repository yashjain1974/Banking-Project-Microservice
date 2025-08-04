import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Account } from '../../../core/models/account.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <div class="account-detail-container" *ngIf="account">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Account Details</h1>
      </div>
      
      <mat-card class="account-overview-card">
        <mat-card-content>
          <div class="account-overview">
            <div class="account-info">
              <h2>{{account.accountType}} Account</h2>
              <p class="account-number">{{account.accountNumber}}</p>
              <mat-chip [class]="getStatusClass(account.status)">
                {{account.status}}
              </mat-chip>
            </div>
            <div class="balance-info">
              <p class="balance-label">Available Balance</p>
              <p class="balance-amount">₹{{account.balance | number:'1.2-2'}}</p>
            </div>
          </div>
          
          <div class="account-actions">
            <button mat-raised-button color="primary">
              <mat-icon>add</mat-icon>
              Deposit
            </button>
            <button mat-raised-button color="accent">
              <mat-icon>remove</mat-icon>
              Withdraw
            </button>
            <button mat-raised-button>
              <mat-icon>swap_horiz</mat-icon>
              Transfer
            </button>
          </div>
        </mat-card-content>
      </mat-card>
      
      <mat-tab-group class="account-tabs">
        <mat-tab label="Transactions">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Transaction History</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="transactions-table" *ngIf="transactions.length > 0; else noTransactions">
                  <table mat-table [dataSource]="transactions" class="full-width">
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
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
                    
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let transaction">
                        <span [class]="getAmountClass(transaction.type)">
                          {{getAmountPrefix(transaction.type)}}₹{{transaction.amount | number:'1.2-2'}}
                        </span>
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let transaction">
                        <mat-chip [class]="getTransactionStatusClass(transaction.status)">
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
        
        <mat-tab label="Account Details">
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                <div class="details-grid">
                  <div class="detail-item">
                    <label>Account ID</label>
                    <span>{{account.accountId}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Account Number</label>
                    <span>{{account.accountNumber}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Account Type</label>
                    <span>{{account.accountType}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Status</label>
                    <span>{{account.status}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Created Date</label>
                    <span>{{account.createdAt | date:'medium'}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Current Balance</label>
                    <span class="balance">₹{{account.balance | number:'1.2-2'}}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .account-detail-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .account-overview-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .account-overview {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    
    .account-info h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    .account-number {
      margin: 8px 0;
      font-family: monospace;
      font-size: 16px;
      color: #666;
    }
    
    .balance-info {
      text-align: right;
    }
    
    .balance-label {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    
    .balance-amount {
      margin: 4px 0 0 0;
      font-size: 32px;
      font-weight: 700;
      color: #2e7d32;
    }
    
    .account-actions {
      display: flex;
      gap: 16px;
    }
    
    .account-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .tab-content {
      padding: 24px;
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
    
    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .status-closed {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .no-transactions {
      text-align: center;
      padding: 48px;
      color: #666;
    }
    
    .no-transactions mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .detail-item label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .detail-item span {
      font-size: 16px;
      color: #333;
    }
    
    .detail-item .balance {
      font-size: 20px;
      font-weight: 600;
      color: #2e7d32;
    }
    
    @media (max-width: 768px) {
      .account-overview {
        flex-direction: column;
        gap: 16px;
      }
      
      .balance-info {
        text-align: left;
      }
      
      .account-actions {
        flex-wrap: wrap;
      }
    }
  `]
})
export class AccountDetailComponent implements OnInit {
  account: Account | null = null;
  transactions: Transaction[] = [];
  displayedColumns: string[] = ['date', 'type', 'amount', 'status'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    const accountId = this.route.snapshot.paramMap.get('id');
    if (accountId) {
      this.loadAccountDetails(accountId);
      this.loadTransactions(accountId);
    }
  }

  private loadAccountDetails(accountId: string): void {
    this.accountService.getAccountById(accountId).subscribe({
      next: (account) => this.account = account,
      error: () => this.router.navigate(['/accounts'])
    });
  }

  private loadTransactions(accountId: string): void {
    this.transactionService.getTransactionsByAccountId(accountId).subscribe({
      next: (transactions) => this.transactions = transactions,
      error: () => console.error('Failed to load transactions')
    });
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
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

  getAmountClass(type: string): string {
    return type === 'DEPOSIT' ? 'amount-positive' : 'amount-negative';
  }

  getAmountPrefix(type: string): string {
    return type === 'DEPOSIT' ? '+' : '-';
  }

  getTransactionStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}