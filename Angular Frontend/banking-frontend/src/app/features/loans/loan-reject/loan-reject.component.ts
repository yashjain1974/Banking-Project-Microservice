
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-loan-reject',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './loan-reject.component.html'
})
export class LoanRejectComponent {
  loanId: string = '';
  response: any;

  constructor(private loanService: LoanService) {}

  rejectLoan() {
    this.loanService.rejectLoan(this.loanId).subscribe({
      next: (res) => this.response = res,
      error: (err) => console.error(err)
    });
  }
}
