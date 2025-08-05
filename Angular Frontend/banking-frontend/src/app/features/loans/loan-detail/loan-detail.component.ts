
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { LoanResponse } from '../../../shared/models/loan-response.model';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatListModule
  ],
  templateUrl: './loan-detail.component.html'
})
export class LoanDetailComponent {
  loanId: string = '';
  loan: LoanResponse | null = null;

  constructor(private loanService: LoanService) { }

  fetchLoan() {
    this.loanService.getLoanById(this.loanId).subscribe({
      next: (data) => this.loan = data,
      error: (err) => console.error(err)
    });
  }
}
