// src/app/features/cards/transaction-limit-modal/transaction-limit-modal.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../card.service'; // Import CardService
import { CardResponse } from '../../../shared/models/card.model'; // Import CardResponse

@Component({
    selector: 'app-transaction-limit-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './transaction-limit-modal.component.html',
    styleUrls: ['./transaction-limit-modal.component.css']
})
export class TransactionLimitModalComponent implements OnInit {
    @Input() card!: CardResponse; // Input: The card object to update
    @Output() closeModal = new EventEmitter<void>(); // Output: Event to close modal
    @Output() limitUpdated = new EventEmitter<CardResponse>(); // Output: Event when limit is updated

    newLimit: number | null = null;
    errorMessage: string | null = null;
    showToast: boolean = false; // For success toast

    constructor(private cardService: CardService) { }

    ngOnInit(): void {
        if (this.card) {
            this.newLimit = this.card.transactionLimit; // Pre-fill with current limit
        }
    }

    // Refactored from inline JS closeTransactionLimitModal
    onCloseModal(): void {
        this.errorMessage = null;
        this.newLimit = null;
        this.closeModal.emit(); // Emit event to parent to close
    }

    // Refactored from inline JS updateTransactionLimit
    onUpdateLimit(): void {
        this.errorMessage = null;
        if (this.newLimit === null || this.newLimit < 1000 || this.newLimit > 1000000) {
            this.errorMessage = 'Please enter a valid limit between ₹1,000 and ₹10,00,000.';
            return;
        }

        if (!this.card || !this.card.cardId) {
            this.errorMessage = 'Card information is missing for update.';
            return;
        }

        this.cardService.updateTransactionLimit(this.card.cardId, this.newLimit).subscribe(
            (response) => {
                this.showSuccessToast();
                this.limitUpdated.emit(response); // Emit updated card data
                this.onCloseModal(); // Close modal after success
            },
            (error) => {
                console.error('Update limit failed:', error);
                this.errorMessage = error.error?.message || 'Failed to update transaction limit.';
            }
        );
    }

    // Refactored from inline JS showSuccessToast
    showSuccessToast(): void {
        this.showToast = true;
        setTimeout(() => {
            this.showToast = false;
        }, 3000);
    }

    // Refactored from inline JS formatNumber (Angular pipes handle this better)
    // formatNumber(num: number): string {
    //   return parseInt(num.toString()).toLocaleString('en-IN');
    // }
}