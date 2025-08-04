import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';

import { CreditCardService } from '../../../core/services/credit-card.service';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import { CardType } from '../../../core/models/credit-card.model';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-card-apply',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="apply-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Apply for Credit Card</h1>
      </div>
      
      <mat-card class="apply-card">
        <mat-card-header>
          <mat-card-title>Credit Card Application</mat-card-title>
          <mat-card-subtitle>Choose your preferred card type and settings</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="cardForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Linked Account</mat-label>
              <mat-select formControlName="accountId" required>
                <mat-option *ngFor="let account of accounts" [value]="account.accountId">
                  {{account.accountType}} - {{account.accountNumber}} 
                  (₹{{account.balance | number:'1.2-2'}})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="cardForm.get('accountId')?.hasError('required')">
                Please select an account to link
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Card Type</mat-label>
              <mat-select formControlName="cardType" required>
                <mat-option value="VISA">Visa</mat-option>
                <mat-option value="MASTERCARD">Mastercard</mat-option>
                <mat-option value="AMERICAN_EXPRESS">American Express</mat-option>
                <mat-option value="RUPAY">RuPay</mat-option>
                <mat-option value="DISCOVER">Discover</mat-option>
              </mat-select>
              <mat-error *ngIf="cardForm.get('cardType')?.hasError('required')">
                Card type is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Transaction Limit</mat-label>
              <input matInput type="number" formControlName="transactionLimit" 
                     placeholder="50000" min="1000" max="1000000" required>
              <span matTextPrefix>₹&nbsp;</span>
              <mat-hint>Daily transaction limit (₹1,000 - ₹10,00,000)</mat-hint>
              <mat-error *ngIf="cardForm.get('transactionLimit')?.hasError('required')">
                Transaction limit is required
              </mat-error>
              <mat-error *ngIf="cardForm.get('transactionLimit')?.hasError('min')">
                Minimum limit is ₹1,000
              </mat-error>
              <mat-error *ngIf="cardForm.get('transactionLimit')?.hasError('max')">
                Maximum limit is ₹10,00,000
              </mat-error>
            </mat-form-field>
            
            <div class="card-preview" *ngIf="cardForm.get('cardType')?.value">
              <h4>Card Preview</h4>
              <div class="preview-card" [class]="getPreviewCardClass()">
                <div class="preview-header">
                  <span class="card-type-name">{{cardForm.get('cardType')?.value}}</span>
                  <mat-icon>credit_card</mat-icon>
                </div>
                <div class="preview-number">•••• •••• •••• ••••</div>
                <div class="preview-details">
                  <div class="preview-item">
                    <span class="label">VALID THRU</span>
                    <span class="value">{{getExpiryDate()}}</span>
                  </div>
                  <div class="preview-item">
                    <span class="label">LIMIT</span>
                    <span class="value">₹{{cardForm.get('transactionLimit')?.value | number:'1.0-0'}}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="cardForm.invalid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Apply for Card</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .apply-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
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
    
    .apply-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .card-preview {
      margin: 24px 0;
    }
    
    .card-preview h4 {
      margin: 0 0 16px 0;
      color: #333;
    }
    
    .preview-card {
      padding: 24px;
      border-radius: 12px;
      color: white;
      min-height: 180px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .preview-card.visa {
      background: linear-gradient(135deg, #1a237e, #3949ab);
    }
    
    .preview-card.mastercard {
      background: linear-gradient(135deg, #d32f2f, #f44336);
    }
    
    .preview-card.american_express {
      background: linear-gradient(135deg, #2e7d32, #4caf50);
    }
    
    .preview-card.rupay {
      background: linear-gradient(135deg, #ff6f00, #ff9800);
    }
    
    .preview-card.discover {
      background: linear-gradient(135deg, #424242, #616161);
    }
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-type-name {
      font-size: 16px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .preview-number {
      font-family: 'Courier New', monospace;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 4px;
      margin: 16px 0;
    }
    
    .preview-details {
      display: flex;
      justify-content: space-between;
    }
    
    .preview-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .preview-item .label {
      font-size: 10px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .preview-item .value {
      font-size: 14px;
      font-weight: 500;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }
    
    mat-card-header {
      margin-bottom: 24px;
    }
    
    mat-card-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    mat-card-subtitle {
      font-size: 16px;
      color: #666;
      margin-top: 8px;
    }
  `]
})
export class CardApplyComponent implements OnInit {
  cardForm: FormGroup;
  accounts: Account[] = [];
  isLoading = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private creditCardService: CreditCardService,
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.cardForm = this.fb.group({
      accountId: ['', [Validators.required]],
      cardType: ['', [Validators.required]],
      transactionLimit: ['', [Validators.required, Validators.min(1000), Validators.max(1000000)]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadAccounts(user.userId);
      }
    });
  }

  private loadAccounts(userId: string): void {
    this.accountService.getAccountsByUserId(userId).subscribe({
      next: (accounts) => this.accounts = accounts.filter(acc => acc.status === 'ACTIVE'),
      error: () => console.error('Failed to load accounts')
    });
  }

  onSubmit(): void {
    if (this.cardForm.valid && this.currentUser) {
      this.isLoading = true;
      
      const cardData = {
        userId: this.currentUser.userId,
        accountId: this.cardForm.value.accountId,
        cardType: this.cardForm.value.cardType as CardType,
        transactionLimit: this.cardForm.value.transactionLimit,
        issueDate: new Date().toISOString().split('T')[0],
        cardNumber: this.generateCardNumber(),
        expiryDate: this.getExpiryDate()
      };

      this.creditCardService.issueCard(cardData).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Credit card application submitted successfully!', 'Success');
          this.router.navigate(['/cards']);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/cards']);
  }

  getPreviewCardClass(): string {
    const cardType = this.cardForm.get('cardType')?.value;
    return cardType ? cardType.toLowerCase().replace('_', '') : '';
  }

  getExpiryDate(): string {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    return expiryDate.toISOString().split('T')[0];
  }

  private generateCardNumber(): string {
    // Generate a mock card number for demo
    return '4000' + Math.random().toString().slice(2, 14);
  }
}