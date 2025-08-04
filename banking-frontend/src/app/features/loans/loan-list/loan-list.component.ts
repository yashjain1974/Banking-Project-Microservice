import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan, LoanType } from '../../../core/models/loan.model';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="loans-container">
      <div class="header">
        <h1>My Loans</h1>
        <button mat-raised-button color="primary" routerLink="/loans/apply">
          <mat-icon>add</mat-icon>
          Apply for Loan
        </button>
      </div>
      
      <div class="loans-grid" *ngIf="loans.length > 0; else noLoans">
        <mat-card class="loan-card" *ngFor="let loan of loans">
          <mat-card-header>
            <div class="loan-header">
              <div class="loan-info">
                <h3>{{getLoanTypeDisplay(loan.loanType)}} Loan</h3>
                <p class="loan-id">Loan ID: {{loan.loanId}}</p>
              </div>
              <mat-chip [class]="getStatusClass(loan.status)">
                {{loan.status}}
              </mat-chip>
            </div>
          </mat-card-header>
          
          <mat-card-content>
            <div class="loan-amount">
              <p class="amount-label">Loan Amount</p>
              <p class="amount-value">₹{{loan.amount | number:'1.2-2'}}</p>
            </div>
            
            <div class="loan-details">
              <div class="detail-row">
                <span class="label">Interest Rate:</span>
                <span class="value">{{loan.interestRate}}% per annum</span>
              </div>
              <div class="detail-row">
                <span class="label">Tenure:</span>
                <span class="value">{{loan.tenureInMonths}} months</span>
              </div>
              <div class="detail-row">
                <span class="label">Application Date:</span>
                <span class="value">{{loan.applicationDate | date:'mediumDate'}}</span>
              </div>
              <div class="detail-row" *ngIf="loan.status === 'APPROVED'">
                <span class="label">Monthly EMI:</span>
                <span class="value emi">₹{{calculateEMI(loan) | number:'1.2-2'}}</span>
              </div>
            </div>
            
            <div class="loan-progress" *ngIf="loan.status === 'APPROVED'">
              <div class="progress-info">
                <span>Loan Progress</span>
                <span>{{getProgressPercentage(loan)}}%</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="getProgressPercentage(loan)"></mat-progress-bar>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button routerLink="/loans/{{loan.loanId}}">
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
            <button mat-button *ngIf="loan.status === 'APPROVED'" (click)="calculateEMIForLoan(loan.loanId)">
              <mat-icon>calculate</mat-icon>
              Calculate EMI
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <ng-template #noLoans>
        <mat-card class="no-loans-card">
          <mat-card-content>
            <div class="no-loans-content">
              <mat-icon class="no-loans-icon">home</mat-icon>
              <h2>No Loans</h2>
              <p>You don't have any loan applications yet. Apply for a loan to get started!</p>
              <button mat-raised-button color="primary" routerLink="/loans/apply">
                <mat-icon>add</mat-icon>
                Apply for Loan
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .loans-container {
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
    
    .loans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }
    
    .loan-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .loan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .loan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }
    
    .loan-info h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
    
    .loan-id {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #666;
      font-family: monospace;
    }
    
    .loan-amount {
      margin: 16px 0;
      padding: 16px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 8px;
      text-align: center;
    }
    
    .amount-label {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    
    .amount-value {
      margin: 4px 0 0 0;
      font-size: 32px;
      font-weight: 700;
      color: #2e7d32;
    }
    
    .loan-details {
      margin: 16px 0;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 4px 0;
    }
    
    .detail-row .label {
      color: #666;
      font-size: 14px;
    }
    
    .detail-row .value {
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }
    
    .detail-row .value.emi {
      color: #2e7d32;
      font-weight: 600;
      font-size: 16px;
    }
    
    .loan-progress {
      margin-top: 16px;
    }
    
    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
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
    
    .no-loans-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .no-loans-content {
      text-align: center;
      padding: 48px 24px;
    }
    
    .no-loans-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .no-loans-content h2 {
      color: #333;
      margin-bottom: 16px;
    }
    
    .no-loans-content p {
      color: #666;
      margin-bottom: 24px;
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .loans-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoanListComponent implements OnInit {
  loans: Loan[] = [];

  constructor(
    private loanService: LoanService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadLoans(user.userId);
      }
    });
  }

  private loadLoans(userId: string): void {
    this.loanService.getLoansByUserId(userId).subscribe({
      next: (loans) => this.loans = loans,
      error: () => console.error('Failed to load loans')
    });
  }

  getLoanTypeDisplay(loanType: LoanType): string {
    switch (loanType) {
      case LoanType.HOME: return 'Home';
      case LoanType.PERSONAL: return 'Personal';
      case LoanType.AUTO: return 'Auto';
      case LoanType.EDUCATION: return 'Education';
      case LoanType.BUSINESS: return 'Business';
      default: return loanType;
    }
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  calculateEMI(loan: Loan): number {
    const principal = loan.amount;
    const monthlyRate = loan.interestRate / 12 / 100;
    const months = loan.tenureInMonths;
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.round(emi * 100) / 100;
  }

  getProgressPercentage(loan: Loan): number {
    // This is a mock calculation - in real app, you'd track actual payments
    const monthsSinceStart = Math.floor(
      (new Date().getTime() - new Date(loan.applicationDate).getTime()) / 
      (1000 * 60 * 60 * 24 * 30)
    );
    return Math.min((monthsSinceStart / loan.tenureInMonths) * 100, 100);
  }

  calculateEMIForLoan(loanId: string): void {
    this.loanService.calculateEmi(loanId).subscribe({
      next: (emi) => {
        alert(`Monthly EMI: ₹${emi.toFixed(2)}`);
      },
      error: () => console.error('Failed to calculate EMI')
    });
  }
}