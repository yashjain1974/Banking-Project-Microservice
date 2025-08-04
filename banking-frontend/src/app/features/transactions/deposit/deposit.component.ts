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
import { ToastrService } from 'ngx-toastr';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-deposit',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="deposit-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Deposit Money</h1>
      </div>
      
      <mat-card class="deposit-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="title-icon">add_circle</mat-icon>
            Deposit Funds
          </mat-card-title>
          <mat-card-subtitle>Add money to your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="depositForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Account</mat-label>
              <mat-select formControlName="accountId" required>
                <mat-option *ngFor="let account of accounts" [value]="account.accountId">
                  {{account.accountType}} - {{account.accountNumber}} 
                  (Balance: ₹{{account.balance | number:'1.2-2'}})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="depositForm.get('accountId')?.hasError('required')">
                Please select an account
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Deposit Amount</mat-label>
              <input matInput type="number" formControlName="amount" 
                     placeholder="0.00" min="0.01" step="0.01" required>
              <span matTextPrefix>₹&nbsp;</span>
              <mat-error *ngIf="depositForm.get('amount')?.hasError('required')">
                Amount is required
              </mat-error>
              <mat-error *ngIf="depositForm.get('amount')?.hasError('min')">
                Amount must be greater than ₹0
              </mat-error>
            </mat-form-field>
            
            <div class="deposit-info">
              <div class="info-item">
                <mat-icon>info</mat-icon>
                <span>Deposits are processed instantly</span>
              </div>
              <div class="info-item">
                <mat-icon>security</mat-icon>
                <span>All transactions are secured with bank-level encryption</span>
              </div>
            </div>
            
            <div class="deposit-summary" *ngIf="depositForm.valid">
              <h4>Deposit Summary</h4>
              <div class="summary-item">
                <span>Account:</span>
                <span>{{getSelectedAccountInfo()}}</span>
              </div>
              <div class="summary-item">
                <span>Current Balance:</span>
                <span>₹{{getSelectedAccountBalance() | number:'1.2-2'}}</span>
              </div>
              <div class="summary-item">
                <span>Deposit Amount:</span>
                <span>₹{{depositForm.get('amount')?.value | number:'1.2-2'}}</span>
              </div>
              <div class="summary-item total">
                <span>New Balance:</span>
                <span>₹{{getNewBalance() | number:'1.2-2'}}</span>
              </div>
            </div>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="depositForm.invalid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Deposit Money</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .deposit-container {
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
    
    .deposit-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .title-icon {
      color: #4CAF50;
      margin-right: 8px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .deposit-info {
      background: #e8f5e8;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #2e7d32;
    }
    
    .info-item:last-child {
      margin-bottom: 0;
    }
    
    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .deposit-summary {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    
    .deposit-summary h4 {
      margin: 0 0 16px 0;
      color: #333;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      color: #666;
    }
    
    .summary-item.total {
      font-weight: 600;
      color: #333;
      border-top: 1px solid #ddd;
      padding-top: 8px;
      margin-top: 8px;
      font-size: 16px;
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
      display: flex;
      align-items: center;
    }
    
    mat-card-subtitle {
      font-size: 16px;
      color: #666;
      margin-top: 8px;
    }
  `]
})
export class DepositComponent implements OnInit {
  depositForm: FormGroup;
  accounts: Account[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.depositForm = this.fb.group({
      accountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
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
    if (this.depositForm.valid) {
      this.isLoading = true;
      
      this.transactionService.deposit(this.depositForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Deposit completed successfully!', 'Success');
          this.router.navigate(['/transactions']);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/transactions']);
  }

  getSelectedAccountInfo(): string {
    const accountId = this.depositForm.get('accountId')?.value;
    const account = this.accounts.find(acc => acc.accountId === accountId);
    return account ? `${account.accountType} - ${account.accountNumber}` : '';
  }

  getSelectedAccountBalance(): number {
    const accountId = this.depositForm.get('accountId')?.value;
    const account = this.accounts.find(acc => acc.accountId === accountId);
    return account ? account.balance : 0;
  }

  getNewBalance(): number {
    const currentBalance = this.getSelectedAccountBalance();
    const depositAmount = this.depositForm.get('amount')?.value || 0;
    return currentBalance + depositAmount;
  }
}