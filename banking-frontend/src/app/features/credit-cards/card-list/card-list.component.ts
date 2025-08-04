import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { ToastrService } from 'ngx-toastr';

import { CreditCardService } from '../../../core/services/credit-card.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreditCard, CardStatus } from '../../../core/models/credit-card.model';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule
  ],
  template: `
    <div class="cards-container">
      <div class="header">
        <h1>My Credit Cards</h1>
        <button mat-raised-button color="primary" routerLink="/cards/apply">
          <mat-icon>add</mat-icon>
          Apply for Card
        </button>
      </div>
      
      <div class="cards-grid" *ngIf="creditCards.length > 0; else noCards">
        <mat-card class="credit-card" *ngFor="let card of creditCards" [class]="getCardTypeClass(card.cardType)">
          <mat-card-content>
            <div class="card-header">
              <div class="card-type">
                <mat-icon>credit_card</mat-icon>
                <span>{{card.cardType}}</span>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="cardMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #cardMenu="matMenu">
                <button mat-menu-item (click)="viewDetails(card.cardId)">
                  <mat-icon>visibility</mat-icon>
                  <span>View Details</span>
                </button>
                <button mat-menu-item (click)="toggleCardStatus(card)" 
                        [disabled]="isLoading">
                  <mat-icon>{{card.status === 'ACTIVE' ? 'block' : 'check_circle'}}</mat-icon>
                  <span>{{card.status === 'ACTIVE' ? 'Block Card' : 'Unblock Card'}}</span>
                </button>
                <button mat-menu-item (click)="updateLimit(card)">
                  <mat-icon>edit</mat-icon>
                  <span>Update Limit</span>
                </button>
              </mat-menu>
            </div>
            
            <div class="card-number">
              <span class="masked-number">•••• •••• •••• {{getLastFourDigits(card.cardNumber)}}</span>
            </div>
            
            <div class="card-details">
              <div class="detail-item">
                <span class="label">Valid Thru</span>
                <span class="value">{{card.expiryDate | date:'MM/yy'}}</span>
              </div>
              <div class="detail-item">
                <span class="label">Limit</span>
                <span class="value">₹{{card.transactionLimit | number:'1.0-0'}}</span>
              </div>
            </div>
            
            <div class="card-status">
              <mat-chip [class]="getStatusClass(card.status)">
                {{card.status}}
              </mat-chip>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button routerLink="/cards/{{card.cardId}}">
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
            <button mat-button routerLink="/cards/{{card.cardId}}/transactions">
              <mat-icon>receipt_long</mat-icon>
              Transactions
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <ng-template #noCards>
        <mat-card class="no-cards-card">
          <mat-card-content>
            <div class="no-cards-content">
              <mat-icon class="no-cards-icon">credit_card</mat-icon>
              <h2>No Credit Cards</h2>
              <p>You don't have any credit cards yet. Apply for your first card to get started!</p>
              <button mat-raised-button color="primary" routerLink="/cards/apply">
                <mat-icon>add</mat-icon>
                Apply for Credit Card
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .cards-container {
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
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    
    .credit-card {
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      overflow: hidden;
      position: relative;
    }
    
    .credit-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }
    
    .credit-card.visa {
      background: linear-gradient(135deg, #1a237e, #3949ab);
      color: white;
    }
    
    .credit-card.mastercard {
      background: linear-gradient(135deg, #d32f2f, #f44336);
      color: white;
    }
    
    .credit-card.american_express {
      background: linear-gradient(135deg, #2e7d32, #4caf50);
      color: white;
    }
    
    .credit-card.rupay {
      background: linear-gradient(135deg, #ff6f00, #ff9800);
      color: white;
    }
    
    .credit-card.discover {
      background: linear-gradient(135deg, #424242, #616161);
      color: white;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .card-type {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      font-size: 16px;
    }
    
    .card-number {
      font-family: 'Courier New', monospace;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 24px;
      letter-spacing: 2px;
    }
    
    .card-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .label {
      font-size: 12px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .value {
      font-size: 14px;
      font-weight: 500;
    }
    
    .card-status {
      display: flex;
      justify-content: flex-end;
    }
    
    .status-active {
      background-color: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }
    
    .status-blocked {
      background-color: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }
    
    .no-cards-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .no-cards-content {
      text-align: center;
      padding: 48px 24px;
    }
    
    .no-cards-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .no-cards-content h2 {
      color: #333;
      margin-bottom: 16px;
    }
    
    .no-cards-content p {
      color: #666;
      margin-bottom: 24px;
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CardListComponent implements OnInit {
  creditCards: CreditCard[] = [];
  isLoading = false;

  constructor(
    private creditCardService: CreditCardService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadCreditCards(user.userId);
      }
    });
  }

  private loadCreditCards(userId: string): void {
    this.creditCardService.getCardsByUserId(userId).subscribe({
      next: (cards) => this.creditCards = cards,
      error: () => console.error('Failed to load credit cards')
    });
  }

  getCardTypeClass(cardType: string): string {
    return cardType.toLowerCase().replace('_', '');
  }

  getStatusClass(status: CardStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  getLastFourDigits(cardNumber: string): string {
    return cardNumber.slice(-4);
  }

  viewDetails(cardId: string): void {
    // Navigate to card details
  }

  toggleCardStatus(card: CreditCard): void {
    this.isLoading = true;
    
    const action = card.status === CardStatus.ACTIVE ? 
      this.creditCardService.blockCard(card.cardId) :
      this.creditCardService.unblockCard(card.cardId);

    action.subscribe({
      next: (updatedCard) => {
        this.isLoading = false;
        const index = this.creditCards.findIndex(c => c.cardId === card.cardId);
        if (index !== -1) {
          this.creditCards[index] = updatedCard;
        }
        this.toastr.success(
          `Card ${updatedCard.status === CardStatus.ACTIVE ? 'unblocked' : 'blocked'} successfully!`,
          'Success'
        );
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateLimit(card: CreditCard): void {
    // This would open a dialog to update the limit
    const newLimit = prompt('Enter new transaction limit:', card.transactionLimit.toString());
    if (newLimit && !isNaN(Number(newLimit))) {
      this.creditCardService.updateTransactionLimit(card.cardId, Number(newLimit)).subscribe({
        next: (updatedCard) => {
          const index = this.creditCards.findIndex(c => c.cardId === card.cardId);
          if (index !== -1) {
            this.creditCards[index] = updatedCard;
          }
          this.toastr.success('Transaction limit updated successfully!', 'Success');
        },
        error: () => console.error('Failed to update limit')
      });
    }
  }
}