
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../services/loan.service';
import { LoanRequest } from '../../models/loan-request.model';
import { LoanType } from '../../models/loan-type.enum';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-loan-apply',
  standalone: true,
  imports: [ CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule],
  templateUrl: './loan-apply.component.html'
})
export class LoanApplyComponent {
  loan: LoanRequest = {
    userId: '',
    amount: 0,
    tenureInMonths: 0,
    interestRate: 0,
    loanType: LoanType.HOME
  };
  response: any;

  constructor(private loanService: LoanService) {}

  applyLoan() {
    this.loanService.applyLoan(this.loan).subscribe(res => this.response = res);
  }
}
