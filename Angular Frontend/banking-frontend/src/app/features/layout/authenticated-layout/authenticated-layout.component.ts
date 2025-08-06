// src/app/shared/layouts/authenticated-layout/authenticated-layout.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation.component';
import { SidebarComponent } from '../sidebar/sidebar.component';


@Component({
    selector: 'app-authenticated-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        NavigationComponent,
        SidebarComponent
    ],
    template: `
    <div class="authenticated-layout">
      <app-navigation></app-navigation>

      <div class="content-area">
        <app-sidebar
          [sidebarCollapsed]="sidebarCollapsed"
          [bankingServices]="bankingServices"
          [quickActions]="quickActions"
          (toggleSidebarEvent)="toggleSidebar()"
        ></app-sidebar>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
    styles: [`
    .authenticated-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .content-area {
      display: flex;
      flex: 1;
    }

    .main-content {
      flex: 1;
      padding: 1rem;
    }
  `]
})
export class AuthenticatedLayoutComponent {
    sidebarCollapsed = false;

    bankingServices = [
        {
            title: 'Account Dashboard',
            icon: 'far fa-user-circle',
            route: '/banking-features',
            description: 'View your account overview and banking features'
        },
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
            route: '/bills/pay',
            color: 'success'
        },
        {
            title: 'Mobile Deposit',
            icon: 'fas fa-mobile-alt',
            route: '/transactions/deposit',
            color: 'info'
        },
        {
            title: 'ATM Locator',
            icon: 'fas fa-map-marker-alt',
            route: '/atm-locator',
            color: 'warning'
        }
    ];

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }
}
