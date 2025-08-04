import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { LoanService } from '../../../core/services/loan.service';
import { Loan, LoanType } from '../../../core/models/loan.model';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="loan-detail-container" *ngIf="loan">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Loan Details</h1>
      </div>
      
      <div class="loan-overview">
        <mat-card class="overview-card">
          <mat-card-content>
            <div class="loan-header">
              <div class="loan-info">
                <h2>{{getLoanTypeDisplay(loan.loanType)}} Loan</h2>
                <p class="loan-id">{{loan.loanId}}</p>
              </div>
              <mat-chip [class]="getStatusClass(loan.status)">
                {{loan.status}}
              </mat-chip>
            </div>
            
            <div class="amount-section">
              <div class="amount-item">
                <span class="label">Principal Amount</span>
                <span class="value">₹{{loan.amount | number:'1.2-2'}}</span>
              </div>
              <div class="amount-item" *ngIf="loan.status === 'APPROVED'">
                <span class="label">Monthly EMI</span>
                <span class="value emi">₹{{monthlyEMI | number:'1.2-2'}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="details-card">
          <mat-card-header>
            <mat-card-title>Loan Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="details-grid">
              <div class="detail-item">
                <label>Loan Type</label>
                <span>{{getLoanTypeDisplay(loan.loanType)}}</span>
              </div>
              <div class="detail-item">
                <label>Principal Amount</label>
                <span>₹{{loan.amount | number:'1.2-2'}}</span>
              </div>
              <div class="detail-item">
                <label>Interest Rate</label>
                <span>{{loan.interestRate}}% per annum</span>
              </div>
              <div class="detail-item">
                <label>Tenure</label>
                <span>{{loan.tenureInMonths}} months ({{getYearsDisplay()}})</span>
              </div>
              <div class="detail-item">
                <label>Application Date</label>
                <span>{{loan.applicationDate | date:'medium'}}</span>
              </div>
              <div class="detail-item">
                <label>Status</label>
                <span>{{loan.status}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <mat-card class="emi-card" *ngIf="loan.status === 'APPROVED'">
        <mat-card-header>
          <mat-card-title>EMI Calculator</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="emi-breakdown">
            <div class="emi-item">
              <span class="label">Monthly EMI</span>
              <span class="value">₹{{monthlyEMI | number:'1.2-2'}}</span>
            </div>
            <div class="emi-item">
              <span class="label">Total Interest</span>
              <span class="value">₹{{getTotalInterest() | number:'1.2-2'}}</span>
            </div>
            <div class="emi-item">
              <span class="label">Total Amount</span>
              <span class="value">₹{{getTotalAmount() | number:'1.2-2'}}</span>
            </div>
          </div>
          
          <div class="repayment-progress">
            <div class="progress-header">
              <span>Repayment Progress</span>
              <span>{{getProgressPercentage()}}% Complete</span>
            </div>
            <mat-progress-bar mode="determinate" [value]="getProgressPercentage()"></mat-progress-bar>
            <div class="progress-info">
              <span>{{getMonthsPaid()}} of {{loan.tenureInMonths}} months paid</span>
            </div>
          </div>
          
          <button mat-raised-button color="primary" (click)="calculateEMI()">
            <mat-icon>calculate</mat-icon>
            Recalculate EMI
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .loan-detail-container {
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
    
    .loan-overview {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .overview-card,
    .details-card,
    .emi-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .loan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    
    .loan-info h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    .loan-id {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #666;
      font-family: monospace;
    }
    
    .amount-section {
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }
    
    .amount-item {
      text-align: center;
      flex: 1;
    }
    
    .amount-item .label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .amount-item .value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    .amount-item .value.emi {
      color: #2e7d32;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .detail-item label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .detail-item span {
      font-size: 16px;
      color: #333;
    }
    
    .emi-breakdown {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .emi-item {
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .emi-item .label {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .emi-item .value {
      display: block;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
    
    .repayment-progress {
      margin-bottom: 24px;
    }
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }
    
    .progress-info {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    
    .status-approved {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .status-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }
    
    .status-rejected {
      background-color: #ffebee;
      color: #c62828;
    }
    
    @media (max-width: 768px) {
      .loan-overview {
        grid-template-columns: 1fr;
      }
      
      .amount-section {
        flex-direction: column;
        gap: 16px;
      }
      
      .emi-breakdown {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoanDetailComponent implements OnInit {
  loan: Loan | null = null;
  monthlyEMI = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService
  ) {}

  ngOnInit(): void {
    const loanId = this.route.snapshot.paramMap.get('id');
    if (loanId) {
      this.loadLoanDetails(loanId);
    }
  }

  private loadLoanDetails(loanId: string): void {
    this.loanService.getLoanById(loanId).subscribe({
      next: (loan) => {
        this.loan = loan;
        if (loan.status === 'APPROVED') {
          this.calculateMonthlyEMI();
        }
      },
      error: () => this.router.navigate(['/loans'])
    });
  }

  private calculateMonthlyEMI(): void {
    if (this.loan) {
      const principal = this.loan.amount;
      const monthlyRate = this.loan.interestRate / 12 / 100;
      const months = this.loan.tenureInMonths;
      
      this.monthlyEMI = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
    }
  }

  goBack(): void {
    this.router.navigate(['/loans']);
  }

  getLoanTypeDisplay(loanType: LoanType): string {
    switch (loanType) {
      case LoanType.HOME: return 'Home Loan';
      case LoanType.PERSONAL: return 'Personal Loan';
      case LoanType.AUTO: return 'Auto Loan';
      case LoanType.EDUCATION: return 'Education Loan';
      case LoanType.BUSINESS: return 'Business Loan';
      default: return loanType;
    }
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getYearsDisplay(): string {
    if (!this.loan) return '';
    const years = Math.floor(this.loan.tenureInMonths / 12);
    const months = this.loan.tenureInMonths % 12;
    
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} years`;
    return `${years} years ${months} months`;
  }

  getTotalInterest(): number {
    if (!this.loan) return 0;
    return (this.monthlyEMI * this.loan.tenureInMonths) - this.loan.amount;
  }

  getTotalAmount(): number {
    if (!this.loan) return 0;
    return this.monthlyEMI * this.loan.tenureInMonths;
  }

  getProgressPercentage(): number {
    if (!this.loan) return 0;
    // Mock calculation - in real app, you'd track actual payments
    const monthsSinceStart = Math.floor(
      (new Date().getTime() - new Date(this.loan.applicationDate).getTime()) / 
      (1000 * 60 * 60 * 24 * 30)
    );
    return Math.min((monthsSinceStart / this.loan.tenureInMonths) * 100, 100);
  }

  getMonthsPaid(): number {
    if (!this.loan) return 0;
    return Math.floor(this.getProgressPercentage() / 100 * this.loan.tenureInMonths);
  }

  calculateEMI(): void {
    if (this.loan) {
      this.loanService.calculateEmi(this.loan.loanId).subscribe({
        next: (emi) => {
          this.monthlyEMI = emi;
          alert(`Monthly EMI: ₹${emi.toFixed(2)}`);
        },
        error: () => console.error('Failed to calculate EMI')
      });
    }
  }
}