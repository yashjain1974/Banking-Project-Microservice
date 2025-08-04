import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { CreditCardService } from '../../core/services/credit-card.service';
import { LoanService } from '../../core/services/loan.service';
import { Account } from '../../core/models/account.model';
import { Transaction } from '../../core/models/transaction.model';
import { CreditCard } from '../../core/models/credit-card.model';
import { Loan } from '../../core/models/loan.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <h1 class="page-title">Dashboard</h1>
      <p class="welcome-text">Welcome back, {{currentUser?.firstName}}!</p>
      
      <div class="stats-grid">
        <mat-card class="stat-card balance-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>account_balance_wallet</mat-icon>
              </div>
              <div class="stat-info">
                <h3>Total Balance</h3>
                <p class="stat-value">₹{{totalBalance | number:'1.2-2'}}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card accounts-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>account_balance</mat-icon>
              </div>
              <div class="stat-info">
                <h3>Active Accounts</h3>
                <p class="stat-value">{{accounts.length}}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card cards-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>credit_card</mat-icon>
              </div>
              <div class="stat-info">
                <h3>Credit Cards</h3>
                <p class="stat-value">{{creditCards.length}}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card loans-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>home</mat-icon>
              </div>
              <div class="stat-info">
                <h3>Active Loans</h3>
                <p class="stat-value">{{loans.length}}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <div class="content-grid">
        <mat-card class="recent-transactions-card">
          <mat-card-header>
            <mat-card-title>Recent Transactions</mat-card-title>
            <button mat-button routerLink="/transactions" class="view-all-btn">View All</button>
          </mat-card-header>
          <mat-card-content>
            <div class="transaction-list" *ngIf="recentTransactions.length > 0; else noTransactions">
              <div class="transaction-item" *ngFor="let transaction of recentTransactions.slice(0, 5)">
                <div class="transaction-icon">
                  <mat-icon [class]="getTransactionIconClass(transaction.type)">
                    {{getTransactionIcon(transaction.type)}}
                  </mat-icon>
                </div>
                <div class="transaction-details">
                  <p class="transaction-type">{{transaction.type}}</p>
                  <p class="transaction-date">{{transaction.transactionDate | date:'short'}}</p>
                </div>
                <div class="transaction-amount" [class]="getAmountClass(transaction.type)">
                  {{getAmountPrefix(transaction.type)}}₹{{transaction.amount | number:'1.2-2'}}
                </div>
              </div>
            </div>
            <ng-template #noTransactions>
              <p class="no-data">No recent transactions</p>
            </ng-template>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="quick-actions-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="actions-grid">
              <button mat-raised-button color="primary" routerLink="/transactions/transfer" class="action-btn">
                <mat-icon>swap_horiz</mat-icon>
                Transfer Money
              </button>
              <button mat-raised-button color="accent" routerLink="/accounts/create" class="action-btn">
                <mat-icon>add</mat-icon>
                Open Account
              </button>
              <button mat-raised-button routerLink="/cards/apply" class="action-btn">
                <mat-icon>credit_card</mat-icon>
                Apply for Card
              </button>
              <button mat-raised-button routerLink="/loans/apply" class="action-btn">
                <mat-icon>home</mat-icon>
                Apply for Loan
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-title {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    
    .welcome-text {
      font-size: 16px;
      color: #666;
      margin-bottom: 32px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .balance-card .stat-icon {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
    }
    
    .accounts-card .stat-icon {
      background: linear-gradient(135deg, #2196F3, #1976D2);
      color: white;
    }
    
    .cards-card .stat-icon {
      background: linear-gradient(135deg, #FF9800, #F57C00);
      color: white;
    }
    
    .loans-card .stat-icon {
      background: linear-gradient(135deg, #9C27B0, #7B1FA2);
      color: white;
    }
    
    .stat-info h3 {
      margin: 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .stat-value {
      margin: 4px 0 0 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }
    
    .recent-transactions-card,
    .quick-actions-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .view-all-btn {
      margin-left: auto;
    }
    
    .transaction-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .transaction-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .transaction-item:last-child {
      border-bottom: none;
    }
    
    .transaction-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    
    .transaction-icon.deposit {
      background: #e8f5e8;
      color: #4CAF50;
    }
    
    .transaction-icon.withdraw {
      background: #ffebee;
      color: #f44336;
    }
    
    .transaction-icon.transfer {
      background: #e3f2fd;
      color: #2196F3;
    }
    
    .transaction-details {
      flex: 1;
    }
    
    .transaction-type {
      margin: 0;
      font-weight: 500;
      color: #333;
    }
    
    .transaction-date {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #666;
    }
    
    .transaction-amount {
      font-weight: 600;
      font-size: 16px;
    }
    
    .transaction-amount.positive {
      color: #4CAF50;
    }
    
    .transaction-amount.negative {
      color: #f44336;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .action-btn {
      height: 60px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .no-data {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 32px;
    }
    
    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  creditCards: CreditCard[] = [];
  loans: Loan[] = [];
  totalBalance = 0;

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private creditCardService: CreditCardService,
    private loanService: LoanService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadDashboardData(user.userId);
      }
    });
  }

  private loadDashboardData(userId: string): void {
    // Load accounts
    this.accountService.getAccountsByUserId(userId).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
        this.loadRecentTransactions();
      },
      error: () => console.error('Failed to load accounts')
    });

    // Load credit cards
    this.creditCardService.getCardsByUserId(userId).subscribe({
      next: (cards) => this.creditCards = cards,
      error: () => console.error('Failed to load credit cards')
    });

    // Load loans
    this.loanService.getLoansByUserId(userId).subscribe({
      next: (loans) => this.loans = loans,
      error: () => console.error('Failed to load loans')
    });
  }

  private loadRecentTransactions(): void {
    if (this.accounts.length > 0) {
      // Get transactions for the first account (or you could combine all accounts)
      this.transactionService.getTransactionsByAccountId(this.accounts[0].accountId).subscribe({
        next: (transactions) => {
          this.recentTransactions = transactions
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
        },
        error: () => console.error('Failed to load transactions')
      });
    }
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
    return type === 'DEPOSIT' ? 'positive' : 'negative';
  }

  getAmountPrefix(type: string): string {
    return type === 'DEPOSIT' ? '+' : '-';
  }
}