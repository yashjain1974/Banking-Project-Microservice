// src/app/features/loan-management/loan-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf, ngFor
import { LoanService } from '../loan.service';
import { LoanResponse, LoanStatus } from '../../../shared/models/loan.model';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-management.component.html',
  styleUrls: ['./loan-management.component.css']
})
export class LoanManagementComponent implements OnInit {
  [x: string]: any;
  LoanStatus = LoanStatus; // 👈 exposes enum for template use
  allLoans: LoanResponse[] = [];
  pendingLoans: LoanResponse[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private loanService: LoanService) { }

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.loanService.getAllLoans().subscribe(
      (loans) => {
        this.allLoans = loans;
        this.pendingLoans = loans.filter(loan => loan.status === LoanStatus.PENDING);
        this.loading = false;
        if (this.pendingLoans.length === 0) {
          this.successMessage = 'No pending loan applications found.';
        }
      },
      (error) => {
        console.error('Error loading loans:', error);
        this.errorMessage = error.error?.message || 'Failed to load loans.';
        this.loading = false;
      }
    );
  }

  updateLoanStatus(loanId: string, action: 'approve' | 'reject'): void {
    this.errorMessage = null;
    this.successMessage = null;

    let confirmMessage = `Are you sure you want to ${action} loan ${loanId}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    let actionObservable: Observable<LoanResponse>;
    if (action === 'approve') {
      actionObservable = this.loanService.approveLoan(loanId);
    } else {
      actionObservable = this.loanService.rejectLoan(loanId);
    }

    actionObservable.subscribe(
      (updatedLoan) => {
        this.successMessage = `Loan ${updatedLoan.loanId} ${updatedLoan.status}D successfully.`;
        this.loadLoans(); // Reload list after update
      },
      (error) => {
        console.error(`Error ${action}ing loan ${loanId}:`, error);
        this.errorMessage = error.error?.message || `Failed to ${action} loan ${loanId}.`;
      }
    );
  }

  getLoanStatusClass(status: LoanStatus): string {
    switch (status) {
      case LoanStatus.PENDING: return 'status-pending';
      case LoanStatus.APPROVED: return 'status-approved';
      case LoanStatus.REJECTED: return 'status-rejected';
      default: return '';
    }
  }
}