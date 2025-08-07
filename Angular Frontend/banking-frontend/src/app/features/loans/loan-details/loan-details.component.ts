// loan-details.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoanService } from '../loan.service';
import { LoanResponse, LoanStatus, LoanType } from '../../../shared/models/loan.model';
import { AuthService } from '../../../core/services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-loan-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './loan-details.component.html',
  styleUrls: ['./loan-details.component.css']
})
export class LoanDetailsComponent implements OnInit {
  userLoans: LoanResponse[] = [];
  filteredLoans: LoanResponse[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Filter and search properties
  searchTerm: string = '';
  statusFilter: string = '';
  typeFilter: string = '';

  // View and pagination properties
  viewMode: 'card' | 'table' = 'card';
  currentPage: number = 1;
  pageSize: number = 6;
  sortField: string = 'applicationDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Modal properties
  selectedLoan: LoanResponse | null = null;

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
      this.loanService.getLoansByUserId(userId).subscribe({
        next: (data) => {
          this.userLoans = data;
          this.applyFilters();
          this.loading = false;

          if (this.userLoans.length === 0) {
            this.successMessage = 'You have no loan applications yet. Start your financial journey today!';
          }
        },
        error: (error) => {
          console.error('Error loading user loans:', error);
          this.errorMessage = error.error?.message || 'Failed to load your loan applications. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'User session expired. Please log in again.';
      this.loading = false;
    }
  }

  // Filter and Search Methods
  applyFilters(): void {
    this.filteredLoans = this.userLoans.filter(loan => {
      const matchesSearch = this.matchesSearchTerm(loan);
      const matchesStatus = !this.statusFilter || loan.status === this.statusFilter;
      const matchesType = !this.typeFilter || loan.loanType === this.typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    this.applySorting();
    this.currentPage = 1; // Reset to first page when filters change
  }

  private matchesSearchTerm(loan: LoanResponse): boolean {
    if (!this.searchTerm) return true;

    const searchLower = this.searchTerm.toLowerCase();
    return (
      loan.loanId.toLowerCase().includes(searchLower) ||
      loan.loanType.toLowerCase().includes(searchLower) ||
      loan.status.toLowerCase().includes(searchLower) ||
      loan.amount.toString().includes(searchLower)
    );
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting(): void {
    this.filteredLoans.sort((a, b) => {
      let valueA: any = this.getFieldValue(a, this.sortField);
      let valueB: any = this.getFieldValue(b, this.sortField);

      // Handle different data types
      if (valueA instanceof Date && valueB instanceof Date) {
        valueA = valueA.getTime();
        valueB = valueB.getTime();
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  private getFieldValue(loan: LoanResponse, field: string): any {
    switch (field) {
      case 'loanId': return loan.loanId;
      case 'loanType': return loan.loanType;
      case 'amount': return loan.amount;
      case 'tenureInMonths': return loan.tenureInMonths;
      case 'interestRate': return loan.interestRate;
      case 'applicationDate': return new Date(loan.applicationDate);
      case 'status': return loan.status;
      default: return '';
    }
  }

  // View and Pagination Methods
  setViewMode(mode: 'card' | 'table'): void {
    this.viewMode = mode;
  }

  getFilteredLoans(): LoanResponse[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredLoans.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredLoans.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];

    // Show up to 5 page numbers
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // Statistics Methods
  getTotalLoans(): number {
    return this.userLoans.length;
  }

  getApprovedLoans(): number {
    return this.userLoans.filter(loan =>
      loan.status === LoanStatus.APPROVED ||
      loan.status === LoanStatus.DISBURSED
    ).length;
  }

  getPendingLoans(): number {
    return this.userLoans.filter(loan => loan.status === LoanStatus.PENDING).length;
  }

  getTotalAmount(): number {
    return this.userLoans
      .filter(loan => loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.DISBURSED)
      .reduce((total, loan) => total + loan.amount, 0);
  }

  // Display Helper Methods
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

  getLoanTypeIcon(type: LoanType): string {
    const icons = {
      [LoanType.PERSONAL]: 'fas fa-user',
      [LoanType.HOME]: 'fas fa-home',
      [LoanType.AUTO]: 'fas fa-car',
      [LoanType.BUSINESS]: 'fas fa-briefcase',
      [LoanType.EDUCATION]: 'fas fa-graduation-cap'
    };
    return icons[type] || 'fas fa-file-contract';
  }

  getStatusIcon(status: LoanStatus): string {
    const icons = {
      [LoanStatus.PENDING]: 'fas fa-clock',
      [LoanStatus.APPROVED]: 'fas fa-check-circle',
      [LoanStatus.REJECTED]: 'fas fa-times-circle',
      [LoanStatus.DISBURSED]: 'fas fa-money-bill-wave',
      [LoanStatus.COMPLETED]: 'fas fa-flag-checkered'
    };
    return icons[status] || 'fas fa-info-circle';
  }

  // Loan Actions
  calculateEmiForLoan(loanId: string): void {
    if (!loanId) {
      alert('Invalid loan ID. Please try again.');
      return;
    }

    const loan = this.userLoans.find(l => l.loanId === loanId);
    if (!loan) {
      alert('Loan not found. Please refresh and try again.');
      return;
    }

    // Calculate EMI locally for better UX
    const principal = loan.amount;
    const annualRate = loan.interestRate;
    const months = loan.tenureInMonths;
    const monthlyRate = annualRate / 12 / 100;

    let emi: number;
    if (monthlyRate === 0) {
      emi = principal / months;
    } else {
      emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;

    // Enhanced EMI display
    const emiInfo = `
      Loan EMI Calculation for ${loan.loanId.slice(0, 12)}...
      
      📋 Loan Details:
      • Type: ${this.getLoanTypeDisplay(loan.loanType)}
      • Principal: ${this.formatCurrency(principal)}
      • Tenure: ${months} months
      • Interest Rate: ${annualRate.toFixed(2)}% p.a.
      
      💰 EMI Breakdown:
      • Monthly EMI: ${this.formatCurrency(emi)}
      • Total Interest: ${this.formatCurrency(totalInterest)}
      • Total Payable: ${this.formatCurrency(totalAmount)}
      
      📊 Interest vs Principal: ${((totalInterest / principal) * 100).toFixed(1)}% of loan amount
    `;

    alert(emiInfo);
  }

  viewLoanDetails(loan: LoanResponse): void {
    this.selectedLoan = loan;
    const modal = new bootstrap.Modal(document.getElementById('loanDetailsModal'));
    modal.show();
  }

  openLoanGuide(): void {
    const guide = `
      💡 UGDI Banking Loan Guide
      
      📋 Types of Loans Available:
      • Personal Loan: For personal expenses (10.5% - 24%)
      • Home Loan: For property purchase (8.5% - 12%)
      • Car Loan: For vehicle purchase (9% - 15%)
      • Business Loan: For business needs (12% - 20%)
      • Education Loan: For educational expenses (8% - 16%)
      
      ✅ Eligibility Criteria:
      • Age: 21-65 years
      • Regular income source
      • Good credit score (650+)
      • Valid KYC documents
      
      📄 Required Documents:
      • PAN Card & Aadhaar Card
      • Income proof (salary slips, bank statements)
      • ITR for last 2 years
      • Property documents (for home loans)
      
      🚀 Application Process:
      1. Choose loan type and amount
      2. Fill application form
      3. Upload required documents
      4. Get instant pre-approval
      5. Complete verification
      6. Loan disbursement
      
      For more details, contact our support team at 1800-123-4567
    `;

    alert(guide);
  }

  // Utility Methods
  trackByLoanId(index: number, loan: LoanResponse): string {
    return loan.loanId;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Export functionality (bonus feature)
  exportLoansData(): void {
    if (this.userLoans.length === 0) {
      alert('No loan data to export.');
      return;
    }

    const csvData = this.convertToCSV(this.userLoans);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ugdi_loans_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(loans: LoanResponse[]): string {
    const headers = [
      'Loan ID', 'Type', 'Amount (INR)', 'Tenure (Months)',
      'Interest Rate (%)', 'Application Date', 'Status'
    ];

    const rows = loans.map(loan => [
      loan.loanId,
      this.getLoanTypeDisplay(loan.loanType),
      loan.amount.toString(),
      loan.tenureInMonths.toString(),
      loan.interestRate.toString(),
      new Date(loan.applicationDate).toLocaleDateString('en-IN'),
      loan.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Refresh data periodically (optional)
  private refreshTimer?: number;

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  startAutoRefresh(): void {
    // Auto-refresh every 5 minutes
    this.refreshTimer = window.setInterval(() => {
      if (!this.loading) {
        this.loadUserLoans();
      }
    }, 5 * 60 * 1000);
  }
}