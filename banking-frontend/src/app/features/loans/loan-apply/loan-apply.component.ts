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
import { MatSliderModule } from '@angular/material/slider';
import { ToastrService } from 'ngx-toastr';

import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoanType } from '../../../core/models/loan.model';

@Component({
  selector: 'app-loan-apply',
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
    MatSliderModule
  ],
  template: `
    <div class="apply-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Apply for Loan</h1>
      </div>
      
      <mat-card class="apply-card">
        <mat-card-header>
          <mat-card-title>Loan Application</mat-card-title>
          <mat-card-subtitle>Fill in the details to apply for a loan</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loanForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Loan Type</mat-label>
              <mat-select formControlName="loanType" required>
                <mat-option value="HOME">Home Loan</mat-option>
                <mat-option value="PERSONAL">Personal Loan</mat-option>
                <mat-option value="AUTO">Auto Loan</mat-option>
                <mat-option value="EDUCATION">Education Loan</mat-option>
                <mat-option value="BUSINESS">Business Loan</mat-option>
              </mat-select>
              <mat-error *ngIf="loanForm.get('loanType')?.hasError('required')">
                Loan type is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Loan Amount</mat-label>
              <input matInput type="number" formControlName="amount" 
                     placeholder="100000" min="1000" max="10000000" required>
              <span matTextPrefix>₹&nbsp;</span>
              <mat-hint>Minimum: ₹1,000 | Maximum: ₹1,00,00,000</mat-hint>
              <mat-error *ngIf="loanForm.get('amount')?.hasError('required')">
                Loan amount is required
              </mat-error>
              <mat-error *ngIf="loanForm.get('amount')?.hasError('min')">
                Minimum loan amount is ₹1,000
              </mat-error>
              <mat-error *ngIf="loanForm.get('amount')?.hasError('max')">
                Maximum loan amount is ₹1,00,00,000
              </mat-error>
            </mat-form-field>
            
            <div class="tenure-section">
              <label class="tenure-label">Loan Tenure: {{loanForm.get('tenureInMonths')?.value}} months</label>
              <mat-slider class="tenure-slider" min="6" max="360" step="6" discrete>
                <input matSliderThumb formControlName="tenureInMonths">
              </mat-slider>
              <div class="tenure-info">
                <span>6 months</span>
                <span>30 years</span>
              </div>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Interest Rate</mat-label>
              <input matInput type="number" formControlName="interestRate" 
                     placeholder="8.5" min="1" max="25" step="0.1" required>
              <span matTextSuffix>% per annum</span>
              <mat-error *ngIf="loanForm.get('interestRate')?.hasError('required')">
                Interest rate is required
              </mat-error>
              <mat-error *ngIf="loanForm.get('interestRate')?.hasError('min')">
                Minimum interest rate is 1%
              </mat-error>
              <mat-error *ngIf="loanForm.get('interestRate')?.hasError('max')">
                Maximum interest rate is 25%
              </mat-error>
            </mat-form-field>
            
            <div class="loan-summary" *ngIf="loanForm.valid">
              <h4>Loan Summary</h4>
              <div class="summary-item">
                <span>Loan Type:</span>
                <span>{{getLoanTypeDisplay(loanForm.get('loanType')?.value)}}</span>
              </div>
              <div class="summary-item">
                <span>Principal Amount:</span>
                <span>₹{{loanForm.get('amount')?.value | number:'1.2-2'}}</span>
              </div>
              <div class="summary-item">
                <span>Interest Rate:</span>
                <span>{{loanForm.get('interestRate')?.value}}% per annum</span>
              </div>
              <div class="summary-item">
                <span>Tenure:</span>
                <span>{{loanForm.get('tenureInMonths')?.value}} months</span>
              </div>
              <div class="summary-item total">
                <span>Estimated Monthly EMI:</span>
                <span>₹{{calculateEMI() | number:'1.2-2'}}</span>
              </div>
              <div class="summary-item">
                <span>Total Amount Payable:</span>
                <span>₹{{getTotalAmount() | number:'1.2-2'}}</span>
              </div>
            </div>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="loanForm.invalid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Submit Application</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .apply-container {
      max-width: 700px;
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
    
    .tenure-section {
      margin: 24px 0;
    }
    
    .tenure-label {
      display: block;
      font-size: 16px;
      color: #333;
      margin-bottom: 16px;
      font-weight: 500;
    }
    
    .tenure-slider {
      width: 100%;
      margin-bottom: 8px;
    }
    
    .tenure-info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
    }
    
    .loan-summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    
    .loan-summary h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      color: #666;
    }
    
    .summary-item.total {
      font-weight: 600;
      color: #333;
      border-top: 1px solid #ddd;
      padding-top: 12px;
      margin-top: 12px;
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
    }
    
    mat-card-subtitle {
      font-size: 16px;
      color: #666;
      margin-top: 8px;
    }
  `]
})
export class LoanApplyComponent implements OnInit {
  loanForm: FormGroup;
  isLoading = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loanForm = this.fb.group({
      loanType: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1000), Validators.max(10000000)]],
      tenureInMonths: [60, [Validators.required, Validators.min(6), Validators.max(360)]],
      interestRate: ['', [Validators.required, Validators.min(1), Validators.max(25)]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onSubmit(): void {
    if (this.loanForm.valid && this.currentUser) {
      this.isLoading = true;
      
      const loanData = {
        userId: this.currentUser.userId,
        ...this.loanForm.value
      };

      this.loanService.applyForLoan(loanData).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success('Loan application submitted successfully!', 'Success');
          this.router.navigate(['/loans']);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/loans']);
  }

  getLoanTypeDisplay(loanType: string): string {
    switch (loanType) {
      case 'HOME': return 'Home Loan';
      case 'PERSONAL': return 'Personal Loan';
      case 'AUTO': return 'Auto Loan';
      case 'EDUCATION': return 'Education Loan';
      case 'BUSINESS': return 'Business Loan';
      default: return loanType;
    }
  }

  calculateEMI(): number {
    const amount = this.loanForm.get('amount')?.value || 0;
    const rate = this.loanForm.get('interestRate')?.value || 0;
    const tenure = this.loanForm.get('tenureInMonths')?.value || 0;
    
    if (amount && rate && tenure) {
      const monthlyRate = rate / 12 / 100;
      const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                  (Math.pow(1 + monthlyRate, tenure) - 1);
      return Math.round(emi * 100) / 100;
    }
    
    return 0;
  }

  getTotalAmount(): number {
    const emi = this.calculateEMI();
    const tenure = this.loanForm.get('tenureInMonths')?.value || 0;
    return emi * tenure;
  }
}