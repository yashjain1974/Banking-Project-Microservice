import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banking-features',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './banking-features.component.html',
  styleUrls: ['./banking-features.component.css']
})
export class BankingFeaturesComponent implements OnInit {

  sidebarCollapsed = false;

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
      route: '/bills/pay',
      color: 'success'
    },
    {
      title: 'Mobile Deposit',
      icon: 'fas fa-mobile-alt',
      route: '/transactions/mobile-deposit',
      color: 'info'
    },
    {
      title: 'ATM Locator',
      icon: 'fas fa-map-marker-alt',
      route: '/atm-locator',
      color: 'warning'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}