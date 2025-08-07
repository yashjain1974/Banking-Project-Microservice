// src/app/features/cards/card-management/card-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For update limit form
import { CardService } from '../card.service';


import { AccountService } from '../../accounts/account.service'; // To get account numbers for display
import { CardResponse, CardStatus, CardType } from '../../../shared/models/card.model';
import { AccountResponse } from '../../../shared/models/account.model';
import { AuthService } from '../../../core/services/auth.service';
import { TransactionLimitModalComponent } from '../transaction-limit-modal/transaction-limit-modal.component';


@Component({
  selector: 'app-card-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionLimitModalComponent], // Add modal component
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.css']
})
export class CardManagementComponent implements OnInit {
  userCards: CardResponse[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  CardStatus = CardStatus; // For template access

  userAccounts: AccountResponse[] = []; // To map accountId to accountNumber

  // For modal control
  isModalOpen: boolean = false;
  currentCardForLimitUpdate: CardResponse | null = null;

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

  // Refactored from inline JS toggleAccordion
  toggleAccordion(card: CardResponse): void {
    // Find the item in the list and toggle its active state
    const index = this.userCards.findIndex(c => c.cardId === card.cardId);
    if (index !== -1) {
      // Add a property to CardResponse to track active state in UI
      // Or simply manage it via a single activeCardId
      // For simplicity, let's just toggle a class based on activeCardId
      if (this.currentCardForLimitUpdate?.cardId === card.cardId) {
        this.currentCardForLimitUpdate = null; // Collapse if already open
      } else {
        this.currentCardForLimitUpdate = card; // Expand this card
      }
    }
  }

  // Refactored from inline JS blockCard
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

  // Refactored from inline JS unblockCard
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

  // Refactored from inline JS openTransactionLimitModal
  openUpdateLimitModal(card: CardResponse): void {
    this.currentCardForLimitUpdate = card; // Set the card for the modal
    this.isModalOpen = true; // Open the modal
  }

  // Handler for modal close event
  onModalClose(): void {
    this.isModalOpen = false;
    this.currentCardForLimitUpdate = null;
  }

  // Handler for limit updated event from modal
  onLimitUpdated(updatedCard: CardResponse): void {
    this.successMessage = `Limit for card ${updatedCard.cardNumber.slice(-4)} updated to ₹${updatedCard.transactionLimit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
    this.loadUserCardsAndAccounts(); // Reload cards to show updated limit
  }

  getCardStatusClass(status: CardStatus): string {
    switch (status) {
      case CardStatus.ACTIVE: return 'status-active';
      case CardStatus.BLOCKED: return 'status-blocked';
      default: return '';
    }
  }

  getCardBrandIconClass(cardType: CardType): string {
    switch (cardType) {
      case CardType.VISA: return 'fab fa-cc-visa visa';
      case CardType.MASTERCARD: return 'fab fa-cc-mastercard mastercard';
      case CardType.RUPAY: return 'fas fa-credit-card rupay'; // Font Awesome doesn't have fab fa-cc-rupay
      case CardType.AMERICAN_EXPRESS: return 'fab fa-cc-amex amex';
      case CardType.DISCOVER: return 'fab fa-cc-discover discover';
      default: return 'fas fa-credit-card';
    }
  }

  getCardLogoSrc(cardType: CardType): string {
    // You'll need to place these images in your assets folder
    // For now, these are placeholders. You can use SVG for better quality.
    switch (cardType) {
      case CardType.VISA: return 'assets/images/visa.png';
      case CardType.MASTERCARD: return 'assets/images/mastercard.png';
      case CardType.RUPAY: return 'assets/images/rupay.png';
      case CardType.AMERICAN_EXPRESS: return 'assets/images/amex.png';
      case CardType.DISCOVER: return 'assets/images/discover.png';
      default: return '';
    }
  }
}