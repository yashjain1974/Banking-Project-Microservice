// src/app/features/cards/card-management/card-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For update limit form
import { CardService } from '../card.service';

import { AccountService } from '../../accounts/account.service'; // To get account numbers for display
import { CardResponse, CardStatus } from '../../../shared/models/card.model';
import { AccountResponse } from '../../../shared/models/account.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-card-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.css']
})
export class CardManagementComponent implements OnInit {
  userCards: CardResponse[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  CardStatus = CardStatus; // For template usage

  // For update limit modal/form
  selectedCardIdForLimit: string | null = null;
  newLimit: number | null = null;

  userAccounts: AccountResponse[] = []; // To map accountId to accountNumber

  constructor(
    private cardService: CardService,
    private authService: AuthService,
    private accountService: AccountService // Inject AccountService
  ) { }

  ngOnInit(): void {
    this.loadUserCardsAndAccounts();
  }

  loadUserCardsAndAccounts(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const userId = this.authService.getIdentityClaims()?.sub;

    if (userId) {
      // Load accounts first to map accountIds to numbers
      this.accountService.getAccountsByUserId(userId).subscribe(
        (accountsData) => {
          this.userAccounts = accountsData || [];

          // Then load cards
          this.cardService.getCardsByUserId(userId).subscribe(
            (cardsData) => {
              this.userCards = cardsData || [];
              this.loading = false;
              if (this.userCards.length === 0) {
                this.successMessage = 'You have no cards issued.';
              }
            },
            (error) => {
              console.error('Error loading user cards:', error);
              this.errorMessage = error.error?.message || 'Failed to load your cards.';
              this.loading = false;
            }
          );
        },
        (error) => {
          console.error('Error loading user accounts for card management:', error);
          this.errorMessage = error.error?.message || 'Failed to load associated accounts.';
          this.loading = false;
        }
      );
    } else {
      this.errorMessage = 'User ID not found. Please log in again.';
      this.loading = false;
    }
  }

  getAccountNumber(accountId: string): string {
    const account = this.userAccounts.find(acc => acc.accountId === accountId);
    return account ? account.accountNumber : 'N/A';
  }

  blockCard(cardId: string, cardNumber: string): void {
    if (confirm(`Are you sure you want to BLOCK card ${cardNumber}?`)) {
      this.cardService.blockCard(cardId).subscribe(
        (response) => {
          this.successMessage = `Card ${response.cardNumber.slice(-4)} blocked successfully.`;
          this.loadUserCardsAndAccounts(); // Reload list
        },
        (error) => {
          console.error('Error blocking card:', error);
          this.errorMessage = error.error?.message || 'Failed to block card.';
        }
      );
    }
  }

  unblockCard(cardId: string, cardNumber: string): void {
    if (confirm(`Are you sure you want to UNBLOCK card ${cardNumber}?`)) {
      this.cardService.unblockCard(cardId).subscribe(
        (response) => {
          this.successMessage = `Card ${response.cardNumber.slice(-4)} unblocked successfully.`;
          this.loadUserCardsAndAccounts(); // Reload list
        },
        (error) => {
          console.error('Error unblocking card:', error);
          this.errorMessage = error.error?.message || 'Failed to unblock card.';
        }
      );
    }
  }

  openUpdateLimitModal(card: CardResponse): void {
    this.selectedCardIdForLimit = card.cardId;
    this.newLimit = card.transactionLimit; // Pre-fill with current limit
    // Show modal (you'd typically use a CSS class or Angular Material dialog)
    // For this example, we'll just use a simple prompt or alert.
    const input = prompt(`Enter new transaction limit for card ${card.cardNumber}:`, card.transactionLimit.toString());
    if (input !== null) {
      const limit = parseFloat(input);
      if (!isNaN(limit) && limit > 0) {
        this.updateLimit(card.cardId, limit);
      } else {
        alert('Invalid limit entered. Please enter a positive number.');
      }
    }
  }

  updateLimit(cardId: string, limit: number): void {
    this.errorMessage = null;
    this.successMessage = null;

    this.cardService.updateTransactionLimit(cardId, limit).subscribe(
      (response) => {
        this.successMessage = `Limit for card ${response.cardNumber.slice(-4)} updated to ₹${response.transactionLimit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
        this.loadUserCardsAndAccounts(); // Reload list
      },
      (error) => {
        console.error('Error updating limit:', error);
        this.errorMessage = error.error?.message || 'Failed to update limit.';
      }
    );
  }

  getCardStatusClass(status: CardStatus): string {
    switch (status) {
      case CardStatus.ACTIVE: return 'status-active';
      case CardStatus.BLOCKED: return 'status-blocked';
      default: return '';
    }
  }
}