import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import { CreditCardService } from '../../../core/services/credit-card.service';
import { CreditCard } from '../../../core/models/credit-card.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="card-detail-container" *ngIf="creditCard">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Card Details</h1>
      </div>
      
      <div class="card-overview" [class]="getCardTypeClass(creditCard.cardType)">
        <div class="card-visual">
          <div class="card-header">
            <span class="card-type">{{creditCard.cardType}}</span>
            <mat-icon>credit_card</mat-icon>
          </div>
          <div class="card-number">
            •••• •••• •••• {{getLastFourDigits(creditCard.cardNumber)}}
          </div>
          <div class="card-details">
            <div class="detail-item">
              <span class="label">VALID THRU</span>
              <span class="value">{{creditCard.expiryDate | date:'MM/yy'}}</span>
            </div>
            <div class="detail-item">
              <span class="label">LIMIT</span>
              <span class="value">₹{{creditCard.transactionLimit | number:'1.0-0'}}</span>
            </div>
          </div>
        </div>
        
        <div class="card-info">
          <div class="status-section">
            <mat-chip [class]="getStatusClass(creditCard.status)">
              {{creditCard.status}}
            </mat-chip>
          </div>
          
          <div class="card-actions">
            <button mat-raised-button color="primary" 
                    (click)="toggleCardStatus()" 
                    [disabled]="isLoading">
              <mat-icon>{{creditCard.status === 'ACTIVE' ? 'block' : 'check_circle'}}</mat-icon>
              {{creditCard.status === 'ACTIVE' ? 'Block Card' : 'Unblock Card'}}
            </button>
            <button mat-raised-button (click)="updateLimit()">
              <mat-icon>edit</mat-icon>
              Update Limit
            </button>
          </div>
        </div>
      </div>
      
      <mat-tab-group class="card-tabs">
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
                        {{transaction.type}}
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let transaction">
                        ₹{{transaction.amount | number:'1.2-2'}}
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
                    <p>No transactions found for this card.</p>
                  </div>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <mat-tab label="Card Information">
          <div class="tab-content">
            <mat-card>
              <mat-card-content>
                <div class="details-grid">
                  <div class="detail-item">
                    <label>Card ID</label>
                    <span>{{creditCard.cardId}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Card Number</label>
                    <span>{{getMaskedCardNumber(creditCard.cardNumber)}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Card Type</label>
                    <span>{{creditCard.cardType}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Issue Date</label>
                    <span>{{creditCard.issueDate | date:'mediumDate'}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Expiry Date</label>
                    <span>{{creditCard.expiryDate | date:'mediumDate'}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Status</label>
                    <span>{{creditCard.status}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Transaction Limit</label>
                    <span>₹{{creditCard.transactionLimit | number:'1.2-2'}}</span>
                  </div>
                  <div class="detail-item">
                    <label>Linked Account</label>
                    <span>{{creditCard.accountId}}</span>
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
    .card-detail-container {
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
    
    .card-overview {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      padding: 24px;
      border-radius: 16px;
      color: white;
    }
    
    .card-overview.visa {
      background: linear-gradient(135deg, #1a237e, #3949ab);
    }
    
    .card-overview.mastercard {
      background: linear-gradient(135deg, #d32f2f, #f44336);
    }
    
    .card-overview.american_express {
      background: linear-gradient(135deg, #2e7d32, #4caf50);
    }
    
    .card-overview.rupay {
      background: linear-gradient(135deg, #ff6f00, #ff9800);
    }
    
    .card-overview.discover {
      background: linear-gradient(135deg, #424242, #616161);
    }
    
    .card-visual {
      flex: 1;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-type {
      font-size: 18px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .card-number {
      font-family: 'Courier New', monospace;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 4px;
      margin: 24px 0;
    }
    
    .card-details {
      display: flex;
      justify-content: space-between;
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
      font-size: 16px;
      font-weight: 500;
    }
    
    .card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .card-tabs {
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
    
    .status-active {
      background-color: rgba(76, 175, 80, 0.2);
      color: #4CAF50;
    }
    
    .status-blocked {
      background-color: rgba(244, 67, 54, 0.2);
      color: #f44336;
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
    
    .details-grid .detail-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .details-grid .detail-item label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .details-grid .detail-item span {
      font-size: 16px;
      color: #333;
    }
    
    @media (max-width: 768px) {
      .card-overview {
        flex-direction: column;
      }
      
      .card-info {
        align-items: flex-start;
      }
      
      .card-actions {
        flex-direction: row;
        width: 100%;
      }
    }
  `]
})
export class CardDetailComponent implements OnInit {
  creditCard: CreditCard | null = null;
  transactions: Transaction[] = [];
  displayedColumns: string[] = ['date', 'type', 'amount', 'status'];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditCardService: CreditCardService
  ) {}

  ngOnInit(): void {
    const cardId = this.route.snapshot.paramMap.get('id');
    if (cardId) {
      this.loadCardDetails(cardId);
      this.loadTransactions(cardId);
    }
  }

  private loadCardDetails(cardId: string): void {
    this.creditCardService.getCardById(cardId).subscribe({
      next: (card) => this.creditCard = card,
      error: () => this.router.navigate(['/cards'])
    });
  }

  private loadTransactions(cardId: string): void {
    this.creditCardService.getTransactionsByCardId(cardId).subscribe({
      next: (transactions) => this.transactions = transactions,
      error: () => console.error('Failed to load transactions')
    });
  }

  goBack(): void {
    this.router.navigate(['/cards']);
  }

  getCardTypeClass(cardType: string): string {
    return cardType.toLowerCase().replace('_', '');
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getTransactionStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getLastFourDigits(cardNumber: string): string {
    return cardNumber.slice(-4);
  }

  getMaskedCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 •••• •••• $4');
  }

  toggleCardStatus(): void {
    if (!this.creditCard) return;
    
    this.isLoading = true;
    const action = this.creditCard.status === 'ACTIVE' ? 
      this.creditCardService.blockCard(this.creditCard.cardId) :
      this.creditCardService.unblockCard(this.creditCard.cardId);

    action.subscribe({
      next: (updatedCard) => {
        this.creditCard = updatedCard;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateLimit(): void {
    if (!this.creditCard) return;
    
    const newLimit = prompt('Enter new transaction limit:', this.creditCard.transactionLimit.toString());
    if (newLimit && !isNaN(Number(newLimit))) {
      this.creditCardService.updateTransactionLimit(this.creditCard.cardId, Number(newLimit)).subscribe({
        next: (updatedCard) => {
          this.creditCard = updatedCard;
        },
        error: () => console.error('Failed to update limit')
      });
    }
  }
}