import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // Import AuthService
import { AccountService } from '../accounts/account.service'; // Import AccountService
import { LoanService } from '../loans/loan.service'; // Import LoanService
import { CardService } from '../cards/card.service'; // Import CardService
import { TransactionService } from '../transactions/transaction.service'; // Import TransactionService
import { forkJoin } from 'rxjs'; // Import forkJoin for parallel API calls

@Component({
  selector: 'app-banking-features',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './banking-features.component.html',
  styleUrls: ['./banking-features.component.css']
})
export class BankingFeaturesComponent implements OnInit {

  sidebarCollapsed = false;

  // Data for the dashboard overview
  totalAvailableBalance: number = 0;
  activeCardsCount: number = 0;
  activeLoansCount: number = 0;
  thisMonthTransactionsCount: number = 0; // Or total transactions if simpler

  loadingStats: boolean = true;
  statsErrorMessage: string | null = null;

  bankingServices = [
    {
      title: 'Account Management',
      icon: 'fas fa-user-circle',
      route: '/accounts',
      description: 'Manage your bank accounts and view account details'
    },
    {
      title: 'Transaction History',
      icon: 'fas fa-history',
      route: '/transactions/history',
      description: 'View your complete transaction history'
    },
    {
      title: 'Deposit Funds',
      icon: 'fas fa-plus-circle',
      route: '/transactions/deposit',
      description: 'Deposit money into your account'
    },
    {
      title: 'Withdraw Funds',
      icon: 'fas fa-minus-circle',
      route: '/transactions/withdraw',
      description: 'Withdraw money from your account'
    },
    {
      title: 'Transfer Funds',
      icon: 'fas fa-exchange-alt',
      route: '/transactions/transfer',
      description: 'Transfer money between accounts'
    },
    {
      title: 'Loan History',
      icon: 'fas fa-file-invoice-dollar',
      route: '/loans/history',
      description: 'View your loan history and details'
    },
    {
      title: 'Apply for Loan',
      icon: 'fas fa-hand-holding-usd',
      route: '/loans/apply',
      description: 'Apply for personal or business loans'
    },
    {
      title: 'Manage Cards',
      icon: 'fas fa-credit-card',
      route: '/cards/manage',
      description: 'Manage your debit and credit cards'
    },
    {
      title: 'Issue New Card',
      icon: 'fas fa-plus-square',
      route: '/cards/issue',
      description: 'Request a new debit or credit card'
    }
  ];

  quickActions = [
    {
      title: 'Quick Transfer',
      icon: 'fas fa-bolt',
      route: '/transactions/transfer',
      color: 'primary'
    },
    {
      title: 'Bill Pay',
      icon: 'fas fa-receipt',
      route: '/bills/pay', // Placeholder route, not yet implemented
      color: 'success'
    },
    {
      title: 'Mobile Deposit',
      icon: 'fas fa-mobile-alt',
      route: '/transactions/deposit', // Link to deposit for now
      color: 'info'
    },
    {
      title: 'ATM Locator',
      icon: 'fas fa-map-marker-alt',
      route: '/atm-locator', // Placeholder route, not yet implemented
      color: 'warning'
    }
  ];

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private loanService: LoanService,
    private cardService: CardService,
    private transactionService: TransactionService
  ) { }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  loadDashboardStats(): void {
    this.loadingStats = true;
    this.statsErrorMessage = null;
    const userId = this.authService.getIdentityClaims()?.sub;

    if (!userId) {
      this.statsErrorMessage = 'User ID not found. Cannot load dashboard stats.';
      this.loadingStats = false;
      return;
    }

    // Use forkJoin to make multiple API calls in parallel
    forkJoin({
      accounts: this.accountService.getAccountsByUserId(userId),
      loans: this.loanService.getLoansByUserId(userId),
      cards: this.cardService.getCardsByUserId(userId)
    }).subscribe(
      ({ accounts, loans, cards }) => {
        // Calculate Total Available Balance
        this.totalAvailableBalance = (accounts || [])
          .filter(acc => acc.status === 'ACTIVE')
          .reduce((sum, acc) => sum + acc.balance, 0);

        // Count Active Cards
        this.activeCardsCount = (cards || [])
          .filter(card => card.status === 'ACTIVE')
          .length;

        // Count Active Loans (e.g., PENDING or APPROVED/DISBURSED)
        this.activeLoansCount = (loans || [])
          .filter(loan => loan.status === 'PENDING' || loan.status === 'APPROVED' || loan.status === 'DISBURSED')
          .length;

        // Fetch transaction counts (requires fetching transactions for all accounts)
        // This is a bit more complex for "this month" without a backend summary endpoint.
        // For simplicity, let's just count all transactions across all active accounts.
        // A more robust solution would involve a backend endpoint like /transactions/user/{userId}/summary
        const transactionObservables = (accounts || [])
          .filter(acc => acc.status === 'ACTIVE')
          .map(account => this.transactionService.getTransactionsByAccountId(account.accountId));

        if (transactionObservables.length > 0) {
          forkJoin(transactionObservables).subscribe(
            (transactionsArrays) => {
              this.thisMonthTransactionsCount = transactionsArrays.flat().length; // Count all transactions
              this.loadingStats = false;
            },
            (error) => {
              console.error('Error loading transactions for stats:', error);
              this.statsErrorMessage = error.error?.message || 'Failed to load transaction stats.';
              this.loadingStats = false;
            }
          );
        } else {
          this.thisMonthTransactionsCount = 0;
          this.loadingStats = false;
        }
      },
      (error) => {
        console.error('Error loading dashboard stats:', error);
        this.statsErrorMessage = error.error?.message || 'Failed to load dashboard overview.';
        this.loadingStats = false;
      }
    );
  }
}