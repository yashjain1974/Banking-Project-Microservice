
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoanService } from '../services/loan.service';
import { LoanRequest } from '../../../shared/models/loan-request.model';
import { LoanType } from '../../../shared/models/loan-type.enum';

@Component({
  selector: 'app-loan-apply',
  standalone: true,
  imports: [CommonModule,
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

  constructor(private loanService: LoanService) { }

  applyLoan() {
    this.loanService.applyLoan(this.loan).subscribe(res => this.response = res);
  }
}
