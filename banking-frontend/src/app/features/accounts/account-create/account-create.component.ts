import { Component } from '@angular/core';
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

import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';
import { AccountType } from '../../../core/models/account.model';

@Component({
  selector: 'app-account-create',
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
    <div class="create-account-container">
      <mat-card class="create-account-card">
        <mat-card-header>
          <mat-card-title>Open New Account</mat-card-title>
          <mat-card-subtitle>Choose your account type and initial deposit</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Account Type</mat-label>
              <mat-select formControlName="accountType" required>
                <mat-option value="SAVINGS">Savings Account</mat-option>
                <mat-option value="CURRENT">Current Account</mat-option>
              </mat-select>
              <mat-error *ngIf="accountForm.get('accountType')?.hasError('required')">
                Account type is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Initial Deposit</mat-label>
              <input matInput type="number" formControlName="initialBalance" 
                     placeholder="0.00" min="0" step="0.01" required>
              <span matTextPrefix>₹&nbsp;</span>
              <mat-error *ngIf="accountForm.get('initialBalance')?.hasError('required')">
                Initial deposit is required
              </mat-error>
              <mat-error *ngIf="accountForm.get('initialBalance')?.hasError('min')">
                Initial deposit must be at least ₹0
              </mat-error>
            </mat-form-field>
            
            <div class="account-type-info" *ngIf="accountForm.get('accountType')?.value">
              <div class="info-card" [ngClass]="accountForm.get('accountType')?.value.toLowerCase()">
                <h4>{{getAccountTypeTitle()}} Features:</h4>
                <ul>
                  <li *ngFor="let feature of getAccountFeatures()">{{feature}}</li>
                </ul>
              </div>
            </div>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="accountForm.invalid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Open Account</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-account-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
    }
    
    .create-account-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .account-type-info {
      margin: 24px 0;
    }
    
    .info-card {
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    
    .info-card.savings {
      background: #e8f5e8;
      border-left-color: #4CAF50;
    }
    
    .info-card.current {
      background: #e3f2fd;
      border-left-color: #2196F3;
    }
    
    .info-card h4 {
      margin: 0 0 12px 0;
      color: #333;
    }
    
    .info-card ul {
      margin: 0;
      padding-left: 20px;
    }
    
    .info-card li {
      margin-bottom: 4px;
      color: #666;
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
export class AccountCreateComponent {
  accountForm: FormGroup;
  isLoading = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.accountForm = this.fb.group({
      accountType: ['', [Validators.required]],
      initialBalance: [0, [Validators.required, Validators.min(0)]]
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid && this.currentUser) {
      this.isLoading = true;
      
      const accountData = {
        userId: this.currentUser.userId,
        accountType: this.accountForm.value.accountType as AccountType,
        initialBalance: this.accountForm.value.initialBalance
      };

      this.accountService.createAccount(accountData).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Account created successfully!', 'Success');
          this.router.navigate(['/accounts']);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
  }

  getAccountTypeTitle(): string {
    const type = this.accountForm.get('accountType')?.value;
    return type === 'SAVINGS' ? 'Savings Account' : 'Current Account';
  }

  getAccountFeatures(): string[] {
    const type = this.accountForm.get('accountType')?.value;
    
    if (type === 'SAVINGS') {
      return [
        'Earn interest on your balance',
        'Free online banking',
        'ATM access worldwide',
        'Mobile banking app',
        'Minimum balance: ₹1,000'
      ];
    } else if (type === 'CURRENT') {
      return [
        'No limit on transactions',
        'Overdraft facility available',
        'Business banking features',
        'Checkbook facility',
        'Minimum balance: ₹10,000'
      ];
    }
    
    return [];
  }
}