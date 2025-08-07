// Updated TypeScript Component (loan-management.component.ts)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Add this for ngModel
import { LoanService } from '../loan.service';
import { LoanResponse, LoanStatus } from '../../../shared/models/loan.model';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // 👈 Add FormsModule
  templateUrl: './loan-management.component.html',
  styleUrls: ['./loan-management.component.css']
})
export class LoanManagementComponent implements OnInit {
  LoanStatus = LoanStatus;
  allLoans: LoanResponse[] = [];
  filteredLoans: LoanResponse[] = []; // 👈 Add filtered loans array
  pendingLoans: LoanResponse[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // 👈 Search properties
  searchTerm: string = '';
  selectedStatus: string = 'ALL';
  selectedLoanType: string = 'ALL';
  sortBy: string = 'applicationDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private loanService: LoanService, private authService: AuthService) { }

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
        this.filteredLoans = [...loans]; // 👈 Initialize filtered loans
        this.pendingLoans = loans.filter(loan => loan.status === LoanStatus.PENDING);
        this.applyFilters(); // 👈 Apply initial filters
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

  // 👈 Search and Filter Methods
  applyFilters(): void {
    let filtered = [...this.allLoans];

    // Apply search term filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(loan =>
        loan.loanId.toLowerCase().includes(term) ||
        loan.userId.toLowerCase().includes(term) ||
        loan.loanType.toLowerCase().includes(term) ||
        loan.amount.toString().includes(term)
      );
    }

    // Apply status filter
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(loan => loan.status === this.selectedStatus);
    }

    // Apply loan type filter
    if (this.selectedLoanType !== 'ALL') {
      filtered = filtered.filter(loan => loan.loanType === this.selectedLoanType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'applicationDate':
          aValue = new Date(a.applicationDate);
          bValue = new Date(b.applicationDate);
          break;
        case 'loanType':
          aValue = a.loanType;
          bValue = b.loanType;
          break;
        default:
          aValue = a.applicationDate;
          bValue = b.applicationDate;
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredLoans = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onLoanTypeFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'ALL';
    this.selectedLoanType = 'ALL';
    this.sortBy = 'applicationDate';
    this.sortDirection = 'desc';
    this.applyFilters();
  }

  // 👈 Get unique loan types for filter dropdown
  getUniqueLoanTypes(): string[] {
    const types = [...new Set(this.allLoans.map(loan => loan.loanType))];
    return types.sort();
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
        this.loadLoans();
      },
      (error) => {
        console.error(`Error ${action}ing loan ${loanId}:`, error);
        this.errorMessage = error.error?.message || `Failed to ${action} loan ${loanId}.`;
      }
    );
  }

  logout(): void {
    this.authService.logout();
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