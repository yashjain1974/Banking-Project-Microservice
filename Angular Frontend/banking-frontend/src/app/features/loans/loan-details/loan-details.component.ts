// src/app/features/loans/loan-details/loan-details.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService } from '../loan.service';
import { LoanResponse, LoanStatus } from '../../../shared/models/loan.model';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-loan-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-details.component.html',
  styleUrls: ['./loan-details.component.css']
})
export class LoanDetailsComponent implements OnInit {
  userLoans: LoanResponse[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private loanService: LoanService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUserLoans();
  }

  loadUserLoans(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const userId = this.authService.getIdentityClaims()?.sub;

    if (userId) {
      this.loanService.getLoansByUserId(userId).subscribe(
        (data) => {
          this.userLoans = data;
          this.loading = false;
          if (this.userLoans.length === 0) {
            this.successMessage = 'You have no loan applications.';
          }
        },
        (error) => {
          console.error('Error loading user loans:', error);
          this.errorMessage = error.error?.message || 'Failed to load your loans.';
          this.loading = false;
        }
      );
    } else {
      this.errorMessage = 'User ID not found. Please log in again.';
      this.loading = false;
    }
  }

  getLoanStatusClass(status: LoanStatus): string {
    switch (status) {
      case LoanStatus.PENDING: return 'status-pending';
      case LoanStatus.APPROVED: return 'status-approved';
      case LoanStatus.REJECTED: return 'status-rejected';
      case LoanStatus.DISBURSED: return 'status-disbursed';
      case LoanStatus.COMPLETED: return 'status-completed';
      default: return '';
    }
  }

  calculateEmiForLoan(loanId: string): void {
    this.loanService.calculateEmi(loanId).subscribe(
      (emi) => {
        alert(`Estimated EMI for loan ${loanId.slice(0, 8)}...: ₹${emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      },
      (error) => {
        console.error('Error calculating EMI:', error);
        alert(`Failed to calculate EMI: ${error.error?.message || 'An error occurred.'}`);
      }
    );
  }
}