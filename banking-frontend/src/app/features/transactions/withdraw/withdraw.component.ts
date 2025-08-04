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
  selector: 'app-withdraw',
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
    <div class="withdraw-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Withdraw Money</h1>
      </div>
      
      <mat-card class="withdraw-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="title-icon">remove_circle</mat-icon>
            Withdraw Funds
          </mat-card-title>
          <mat-card-subtitle>Withdraw money from your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="withdrawForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Account</mat-label>
              <mat-select formControlName="accountId" required>
                <mat-option *ngFor="let account of accounts" [value]="account.accountId">
                  {{account.accountType}} - {{account.accountNumber}} 
                  (Balance: ₹{{account.balance | number:'1.2-2'}})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="withdrawForm.get('accountId')?.hasError('required')">
                Please select an account
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Withdrawal Amount</mat-label>
              <input matInput type="number" formControlName="amount" 
                     placeholder="0.00" min="0.01" step="0.01" required>
              <span matTextPrefix>₹&nbsp;</span>
              <mat-error *ngIf="withdrawForm.get('amount')?.hasError('required')">
                Amount is required
              </mat-error>
              <mat-error *ngIf="withdrawForm.get('amount')?.hasError('min')">
                Amount must be greater than ₹0
              </mat-error>
              <mat-error *ngIf="withdrawForm.get('amount')?.hasError('insufficientFunds')">
                Insufficient funds in selected account
              </mat-error>
            </mat-form-field>
            
            <div class="withdraw-info">
              <div class="info-item warning">
                <mat-icon>warning</mat-icon>
                <span>Please ensure you have sufficient funds before withdrawing</span>
              </div>
              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <span>Withdrawals are processed instantly</span>
              </div>
            </div>
            
            <div class="withdraw-summary" *ngIf="withdrawForm.valid">
              <h4>Withdrawal Summary</h4>
              <div class="summary-item">
                <span>Account:</span>
                <span>{{getSelectedAccountInfo()}}</span>
              </div>
              <div class="summary-item">
                <span>Current Balance:</span>
                <span>₹{{getSelectedAccountBalance() | number:'1.2-2'}}</span>
              </div>
              <div class="summary-item">
                <span>Withdrawal Amount:</span>
                <span>₹{{withdrawForm.get('amount')?.value | number:'1.2-2'}}</span>
              </div>
              <div class="summary-item total">
                <span>Remaining Balance:</span>
                <span>₹{{getRemainingBalance() | number:'1.2-2'}}</span>
              </div>
            </div>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                Cancel
              </button>
              <button mat-raised-button color="warn" type="submit" 
                      [disabled]="withdrawForm.invalid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Withdraw Money</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .withdraw-container {
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
    
    .withdraw-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .title-icon {
      color: #f44336;
      margin-right: 8px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .withdraw-info {
      background: #fff3e0;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: #ef6c00;
    }
    
    .info-item.warning {
      color: #f57c00;
    }
    
    .info-item:last-child {
      margin-bottom: 0;
    }
    
    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .withdraw-summary {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    
    .withdraw-summary h4 {
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
export class WithdrawComponent implements OnInit {
  withdrawForm: FormGroup;
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
    this.withdrawForm = this.fb.group({
      accountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });

    // Add custom validator for insufficient funds
    this.withdrawForm.get('amount')?.valueChanges.subscribe(() => {
      this.validateSufficientFunds();
    });

    this.withdrawForm.get('accountId')?.valueChanges.subscribe(() => {
      this.validateSufficientFunds();
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

  private validateSufficientFunds(): void {
    const accountId = this.withdrawForm.get('accountId')?.value;
    const amount = this.withdrawForm.get('amount')?.value;
    
    if (accountId && amount) {
      const selectedAccount = this.accounts.find(acc => acc.accountId === accountId);
      if (selectedAccount && amount > selectedAccount.balance) {
        this.withdrawForm.get('amount')?.setErrors({ insufficientFunds: true });
      }
    }
  }

  onSubmit(): void {
    if (this.withdrawForm.valid) {
      this.isLoading = true;
      
      this.transactionService.withdraw(this.withdrawForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Withdrawal completed successfully!', 'Success');
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
    const accountId = this.withdrawForm.get('accountId')?.value;
    const account = this.accounts.find(acc => acc.accountId === accountId);
    return account ? `${account.accountType} - ${account.accountNumber}` : '';
  }

  getSelectedAccountBalance(): number {
    const accountId = this.withdrawForm.get('accountId')?.value;
    const account = this.accounts.find(acc => acc.accountId === accountId);
    return account ? account.balance : 0;
  }

  getRemainingBalance(): number {
    const currentBalance = this.getSelectedAccountBalance();
    const withdrawAmount = this.withdrawForm.get('amount')?.value || 0;
    return currentBalance - withdrawAmount;
  }
}