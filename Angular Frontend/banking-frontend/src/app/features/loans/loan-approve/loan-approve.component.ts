
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-loan-approve',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './loan-approve.component.html'
})
export class LoanApproveComponent {
  loanId: string = '';
  response: any;

  constructor(private loanService: LoanService) {}

  approveLoan() {
    this.loanService.approveLoan(this.loanId).subscribe({
      next: (res) => this.response = res,
      error: (err) => console.error(err)
    });
  }
}
