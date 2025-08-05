import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { LoanResponse } from '../../../shared/models/loan-response.model';
import { LoanService } from '../services/loan.service';


@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './loan-list.component.html'
})
export class LoanListComponent {
  loans: LoanResponse[] = [];

  constructor(private loanService: LoanService) { }

  fetchLoans() {
    this.loanService.getLoans().subscribe((data: LoanResponse[]) => {
      this.loans = data;
    });
  }
}