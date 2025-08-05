// src/app/features/loans/loan-application/loan-application.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../loan.service';

import { Router } from '@angular/router';
import { LoanRequest, LoanResponse, LoanType } from '../../../shared/models/loan.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-loan-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-application.component.html',
  styleUrls: ['./loan-application.component.css']
})
export class LoanApplicationComponent implements OnInit {
  loanForm: LoanRequest = {
    userId: '',
    loanType: LoanType.PERSONAL,
    amount: 0,
    tenureInMonths: 12, // <--- FIX: Changed to tenureInMonths
    interestRate: 10.0
  };
  
  loanTypes = Object.values(LoanType);

  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  calculatedEmi: number | null = null;

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userId = this.authService.getIdentityClaims()?.sub;
    if (userId) {
      this.loanForm.userId = userId;
    } else {
      this.errorMessage = 'User ID not found. Please log in again.';
    }
    this.calculateEmiPreview();
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.calculatedEmi = null;

    if (!this.loanForm.userId) {
      this.errorMessage = 'User ID is missing. Please log in again.';
      this.loading = false;
      return;
    }
    if (this.loanForm.amount <= 0 || this.loanForm.tenureInMonths <= 0 || this.loanForm.interestRate <= 0) { // <--- FIX: Changed to tenureInMonths
      this.errorMessage = 'Amount, tenure, and interest rate must be positive.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.loanService.applyForLoan(this.loanForm).subscribe(
      (response: LoanResponse) => {
        this.successMessage = `Loan application submitted successfully! Loan ID: ${response.loanId.slice(0, 8)}... Status: ${response.status}.`;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/loans/history']);
        }, 3000);
      },
      (error) => {
        console.error('Loan application failed:', error);
        this.errorMessage = error.error?.message || 'Loan application failed. Please try again.';
        this.loading = false;
      }
    );
  }

  calculateEmiPreview(): void {
    if (this.loanForm.amount > 0 && this.loanForm.tenureInMonths > 0 && this.loanForm.interestRate > 0) { // <--- FIX: Changed to tenureInMonths
      const principal = this.loanForm.amount;
      const annualRate = this.loanForm.interestRate;
      const months = this.loanForm.tenureInMonths; // <--- FIX: Changed to tenureInMonths

      const monthlyRate = annualRate / 12 / 100;
      let emi: number;

      if (monthlyRate === 0) {
        emi = principal / months;
      } else {
        emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      }
      this.calculatedEmi = Math.round(emi * 100) / 100;
    } else {
      this.calculatedEmi = null;
    }
  }
}
