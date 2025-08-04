
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../services/loan.service';
import { LoanResponse } from '../../models/loan-response.model';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-loan-user',
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
  templateUrl: './loan-user.component.html'
})
export class LoanUserComponent {
  userId: string = '';
  loans: LoanResponse[] = [];

  constructor(private loanService: LoanService) {}

  fetchLoans() {
    this.loanService.getLoansByUser(this.userId).subscribe({
      next: (data) => (this.loans = data),
      error: (err) => console.error(err)
    });
  }
}
