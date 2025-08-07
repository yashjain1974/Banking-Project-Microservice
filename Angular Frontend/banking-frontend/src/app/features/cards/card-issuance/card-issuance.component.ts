// src/app/features/cards/card-issuance/card-issuance.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel and form handling
import { CardService } from '../card.service'; // Import CardService
import { AccountService } from '../../accounts/account.service'; // To get user's accounts


import { Router } from '@angular/router'; // Import Router for navigation
import { AccountResponse } from '../../../shared/models/account.model';
import { CardRequest, CardResponse, CardType } from '../../../shared/models/card.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-card-issuance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-issuance.component.html',
  styleUrls: ['./card-issuance.component.css']
})
export class CardIssuanceComponent implements OnInit {
  accounts: AccountResponse[] = [];
  cardForm: CardRequest = {
    userId: '',
    accountId: '',
    cardType: CardType.VISA, // Default card type (from your HTML)
    issueDate: '',
    expiryDate: '',
    transactionLimit: 10000 // Default limit (from your HTML)
  };
  cardTypes = Object.values(CardType); // For dropdown/radio options
  CardType = CardType; // For template access
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private cardService: CardService,
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userId = this.authService.getIdentityClaims()?.sub;
    if (userId) {
      this.cardForm.userId = userId;
      this.loadUserAccounts(userId);
    } else {
      this.errorMessage = 'User ID not found. Please log in again.';
    }
    this.setInitialDates();
  }

  loadUserAccounts(userId: string): void {
    this.loading = true;
    this.errorMessage = null;

    this.accountService.getAccountsByUserId(userId).subscribe(
      (data) => {
        this.accounts = data.filter(acc => acc.status === 'ACTIVE'); // Only active accounts
        this.loading = false;
        if (this.accounts.length > 0) {
          this.cardForm.accountId = this.accounts[0].accountId; // Select first active account by default
        } else {
          this.errorMessage = 'No active accounts found to link a card to. Please create an account first.';
        }
      },
      (error) => {
        console.error('Error loading accounts for card issuance:', error);
        this.errorMessage = error.error?.message || 'Failed to load accounts.';
        this.loading = false;
      }
    );
  }

  setInitialDates(): void {
    const today = new Date();
    const issueDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const expiryDate = new Date(today.setFullYear(today.getFullYear() + 5)).toISOString().split('T')[0]; // 5 years from now

    this.cardForm.issueDate = issueDate;
    this.cardForm.expiryDate = expiryDate;
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.cardForm.userId || !this.cardForm.accountId) {
      this.errorMessage = 'User ID or Account ID is missing.';
      this.loading = false;
      return;
    }
    if (this.cardForm.transactionLimit <= 0) {
      this.errorMessage = 'Transaction limit must be positive.';
      this.loading = false;
      return;
    }

    this.cardService.issueCard(this.cardForm).subscribe(
      (response: CardResponse) => {
        this.successMessage = `Card ${response.cardNumber.slice(-4)} (${response.cardType}) issued successfully! Status: ${response.status}.`;
        this.loading = false;
        this.resetForm();
        this.router.navigate(['/cards/manage']); // Redirect to card management
      },
      (error) => {
        console.error('Card issuance failed:', error);
        this.errorMessage = error.error?.message || 'Card issuance failed. Please try again.';
        this.loading = false;
      }
    );
  }

  resetForm(): void {
    this.cardForm = {
      userId: this.cardForm.userId, // Keep user ID
      accountId: this.accounts.length > 0 ? this.accounts[0].accountId : '',
      cardType: CardType.VISA, // Reset to default type
      issueDate: '',
      expiryDate: '',
      transactionLimit: 10000
    };
    this.setInitialDates();
  }
}