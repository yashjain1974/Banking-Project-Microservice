import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  selector: 'app-transfer',
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
    <div class="transfer-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Transfer Money</h1>
      </div>
      
      <mat-card class="transfer-card">
        <mat-card-header>
          <mat-card-title>Fund Transfer</mat-card-title>
          <mat-card-subtitle>Transfer money between accounts</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="transferForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>From Account</mat-label>
              <mat-select formControlName="fromAccountId" required>
                <mat-option *ngFor="let account of accounts" [value]="account.accountId">
                  {{account.accountType}} - {{account.accountNumber}} (₹{{account.balance | number:'1.2-2'}})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="transferForm.get('fromAccountId')?.hasError('required')">
                Please select source account
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>To Account ID</mat-label>
              <input matInput formControlName="toAccountId" 
                     placeholder="Enter destination account ID" required>
              <mat-error *ngIf="transferForm.get('toAccountId')?.hasError('required')">
                Destination account ID is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount" 
                     placeholder="0.00" min="0.01" step="0.01" required>
              <span matTextPrefix>₹&nbsp;</span>
              <mat-error *ngIf="transferForm.get('amount')?.hasError('required')">
                Amount is required
              </mat-error>
              <mat-error *ngIf="transferForm.get('amount')?.hasError('min')">
                Amount must be greater than ₹0
              </mat-error>
              <mat-error *ngIf="transferForm.get('amount')?.hasError('insufficientFunds')">
                Insufficient funds in selected account
              </mat-error>
            </mat-form-field>
            
            <div class="transfer-summary" *ngIf="transferForm.valid">
              <h4>Transfer Summary</h4>
              <div class="summary-item">
                <span>From:</span>
                <span>{{getSelectedAccountInfo()}}</span>
              </div>
              <div class="summary-item">
                <span>To:</span>
                <span>{{transferForm.get('toAccountId')?.value}}</span>
              </div>
              <div class="summary-item total">
                <span>Amount:</span>
                <span>₹{{transferForm.get('amount')?.value | number:'1.2-2'}}</span>
              </div>
            </div>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="transferForm.invalid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Transfer Money</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .transfer-container {
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
    
    .transfer-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .transfer-summary {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
    }
    
    .transfer-summary h4 {
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
export class TransferComponent implements OnInit {
  transferForm: FormGroup;
  accounts: Account[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.transferForm = this.fb.group({
      fromAccountId: ['', [Validators.required]],
      toAccountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });

    // Add custom validator for insufficient funds
    this.transferForm.get('amount')?.valueChanges.subscribe(() => {
      this.validateSufficientFunds();
    });

    this.transferForm.get('fromAccountId')?.valueChanges.subscribe(() => {
      this.validateSufficientFunds();
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadAccounts(user.userId);
      }
    });

    // Check if fromAccount is pre-selected via query params
    this.route.queryParams.subscribe(params => {
      if (params['fromAccount']) {
        this.transferForm.patchValue({ fromAccountId: params['fromAccount'] });
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
    const fromAccountId = this.transferForm.get('fromAccountId')?.value;
    const amount = this.transferForm.get('amount')?.value;
    
    if (fromAccountId && amount) {
      const selectedAccount = this.accounts.find(acc => acc.accountId === fromAccountId);
      if (selectedAccount && amount > selectedAccount.balance) {
        this.transferForm.get('amount')?.setErrors({ insufficientFunds: true });
      }
    }
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      this.isLoading = true;
      
      this.transactionService.transfer(this.transferForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Transfer completed successfully!', 'Success');
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
    const accountId = this.transferForm.get('fromAccountId')?.value;
    const account = this.accounts.find(acc => acc.accountId === accountId);
    return account ? `${account.accountType} - ${account.accountNumber}` : '';
  }
}