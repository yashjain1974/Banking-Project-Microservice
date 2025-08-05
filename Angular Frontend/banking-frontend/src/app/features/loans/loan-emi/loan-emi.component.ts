
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-loan-emi',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './loan-emi.component.html'
})
export class LoanEmiComponent {
  loanId: string = '';
  emiAmount?: number;

  constructor(private loanService: LoanService) {}

  calculateEmi() {
    this.loanService.calculateEmi(this.loanId).subscribe({
      next: (data) => (this.emiAmount = data),
      error: (err) => console.error(err)
    });
  }
}
