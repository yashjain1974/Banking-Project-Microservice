// loan-application.component.ts

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
    tenureInMonths: 12,
    interestRate: 12.0
  };

  loanTypes = Object.values(LoanType);
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  calculatedEmi: number | null = null;
  acceptTerms: boolean = false;
  marketingConsent: boolean = false;

  // Interest rate ranges for different loan types
  private interestRateRanges = {
    [LoanType.PERSONAL]: { min: 10.5, max: 24, default: 15.5 },
    [LoanType.HOME]: { min: 8.5, max: 12, default: 9.5 },
    [LoanType.AUTO]: { min: 9, max: 15, default: 12 },
    [LoanType.BUSINESS]: { min: 12, max: 20, default: 16 },
    [LoanType.EDUCATION]: { min: 8, max: 16, default: 11 }
  };

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeUser();
    this.calculateEmiPreview();
  }

  private initializeUser(): void {
    const userId = this.authService.getIdentityClaims()?.sub;
    if (userId) {
      this.loanForm.userId = userId;
    } else {
      this.showError('User ID not found. Please log in again.');
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.clearMessages();
    this.loading = true;

    this.loanService.applyForLoan(this.loanForm).subscribe({
      next: (response: LoanResponse) => {
        this.showSuccess(
          `Loan application submitted successfully! 
           Loan ID: ${response.loanId.slice(0, 8)}... 
           Status: ${response.status}. 
           You will be redirected to loan history shortly.`
        );
        this.loading = false;

        // Redirect after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/loans/history']);
        }, 3000);
      },
      error: (error) => {
        console.error('Loan application failed:', error);
        this.showError(
          error.error?.message ||
          'Loan application failed. Please check your details and try again.'
        );
        this.loading = false;
      }
    });
  }

  private validateForm(): boolean {
    // Reset messages
    this.clearMessages();

    // Check user ID
    if (!this.loanForm.userId) {
      this.showError('User ID is missing. Please log in again.');
      return false;
    }

    // Validate loan amount
    if (this.loanForm.amount <= 0) {
      this.showError('Please enter a valid loan amount.');
      return false;
    }

    if (this.loanForm.amount < 1000) {
      this.showError('Minimum loan amount is ₹1,000.');
      return false;
    }

    if (this.loanForm.amount > 10000000) {
      this.showError('Maximum loan amount is ₹1,00,00,000.');
      return false;
    }

    // Validate tenure
    if (this.loanForm.tenureInMonths <= 0) {
      this.showError('Please enter a valid loan tenure.');
      return false;
    }

    if (this.loanForm.tenureInMonths < 6) {
      this.showError('Minimum loan tenure is 6 months.');
      return false;
    }

    if (this.loanForm.tenureInMonths > 84) {
      this.showError('Maximum loan tenure is 84 months (7 years).');
      return false;
    }

    // Validate interest rate
    if (this.loanForm.interestRate <= 0) {
      this.showError('Please enter a valid interest rate.');
      return false;
    }

    const rateRange = this.interestRateRanges[this.loanForm.loanType];
    if (this.loanForm.interestRate < rateRange.min || this.loanForm.interestRate > rateRange.max) {
      this.showError(
        `Interest rate for ${this.getLoanTypeDisplay(this.loanForm.loanType)} should be between ${rateRange.min}% and ${rateRange.max}%.`
      );
      return false;
    }

    // Check terms acceptance
    if (!this.acceptTerms) {
      this.showError('Please accept the terms and conditions to proceed.');
      return false;
    }

    return true;
  }

  calculateEmiPreview(): void {
    if (this.loanForm.amount > 0 &&
      this.loanForm.tenureInMonths > 0 &&
      this.loanForm.interestRate > 0) {

      const principal = this.loanForm.amount;
      const annualRate = this.loanForm.interestRate;
      const months = this.loanForm.tenureInMonths;

      const monthlyRate = annualRate / 12 / 100;
      let emi: number;

      if (monthlyRate === 0) {
        emi = principal / months;
      } else {
        emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);
      }

      this.calculatedEmi = Math.round(emi * 100) / 100;
    } else {
      this.calculatedEmi = null;
    }
  }

  onLoanTypeChange(event: any): void {
    const selectedType = event.target.value as LoanType;
    if (selectedType && this.interestRateRanges[selectedType]) {
      // Auto-fill with default interest rate for selected loan type
      this.loanForm.interestRate = this.interestRateRanges[selectedType].default;
      this.calculateEmiPreview();
    }
  }

  getLoanTypeDisplay(type: LoanType): string {
    const displayNames = {
      [LoanType.PERSONAL]: 'Personal Loan',
      [LoanType.HOME]: 'Home Loan',
      [LoanType.AUTO]: 'Car Loan',
      [LoanType.BUSINESS]: 'Business Loan',
      [LoanType.EDUCATION]: 'Education Loan'
    };
    return displayNames[type] || type;
  }

  getTotalInterest(): number {
    if (this.calculatedEmi && this.loanForm.tenureInMonths && this.loanForm.amount) {
      const totalPayment = this.calculatedEmi * this.loanForm.tenureInMonths;
      return Math.round((totalPayment - this.loanForm.amount) * 100) / 100;
    }
    return 0;
  }

  getTotalAmount(): number {
    if (this.calculatedEmi && this.loanForm.tenureInMonths) {
      return Math.round(this.calculatedEmi * this.loanForm.tenureInMonths * 100) / 100;
    }
    return this.loanForm.amount || 0;
  }

  getProcessingFee(): number {
    if (this.loanForm.amount > 0) {
      const feePercent = this.getProcessingFeePercent();
      const calculatedFee = this.loanForm.amount * (feePercent / 100);
      // Min ₹500, Max ₹25,000
      return Math.min(Math.max(calculatedFee, 500), 25000);
    }
    return 0;
  }

  getProcessingFeePercent(): number {
    const feePercentages = {
      [LoanType.PERSONAL]: 2.5,
      [LoanType.HOME]: 0.5,
      [LoanType.AUTO]: 1.0,
      [LoanType.BUSINESS]: 2.0,
      [LoanType.EDUCATION]: 1.0
    };
    return feePercentages[this.loanForm.loanType] || 2.0;
  }

  getLoanSpecificRequirement(): string {
    const requirements = {
      [LoanType.PERSONAL]: 'Minimum salary ₹25,000/month',
      [LoanType.HOME]: 'Property documents required',
      [LoanType.AUTO]: 'Vehicle registration papers',
      [LoanType.BUSINESS]: 'Business registration proof',
      [LoanType.EDUCATION]: 'Admission letter required'
    };
    return requirements[this.loanForm.loanType] || 'Additional documents may be required';
  }

  openTerms(event: Event): void {
    event.preventDefault();
    // In a real application, this would open a modal or navigate to terms page
    alert('Terms and Conditions:\n\n1. All loan applications are subject to credit approval.\n2. Interest rates may vary based on credit score.\n3. Processing fees are non-refundable.\n4. Early repayment charges may apply.\n\nFor complete terms, please visit our website or contact customer service.');
  }

  openPrivacyPolicy(event: Event): void {
    event.preventDefault();
    // In a real application, this would open a modal or navigate to privacy policy page
    alert('Privacy Policy:\n\nWe protect your personal information and use it only for loan processing purposes. Your data is encrypted and stored securely. We do not share your information with third parties without consent.\n\nFor complete privacy policy, please visit our website.');
  }

  openLiveChat(): void {
    // In a real application, this would integrate with a chat service
    alert('Live Chat feature will be available soon! For immediate assistance, please call our customer service at 1800-123-4567.');
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = null;
    // Auto-hide error after 10 seconds
    setTimeout(() => {
      if (this.errorMessage === message) {
        this.errorMessage = null;
      }
    }, 10000);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = null;
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  // Utility method to format currency for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Method to get loan amount in words (useful for formal applications)
  getAmountInWords(amount: number): string {
    // This is a simplified version - you might want to use a proper number-to-words library
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Crore`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} Lakh`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)} Thousand`;
    return amount.toString();
  }
}