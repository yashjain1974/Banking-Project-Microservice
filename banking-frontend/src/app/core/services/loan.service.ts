import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Loan, LoanRequest } from '../models/loan.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly API_URL = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  applyForLoan(request: LoanRequest): Observable<Loan> {
    return this.http.post<Loan>(`${this.API_URL}/apply`, request);
  }

  getLoanById(loanId: string): Observable<Loan> {
    return this.http.get<Loan>(`${this.API_URL}/${loanId}`);
  }

  getLoansByUserId(userId: string): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.API_URL}/user/${userId}`);
  }

  getAllLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.API_URL}`);
  }

  approveLoan(loanId: string): Observable<Loan> {
    return this.http.put<Loan>(`${this.API_URL}/${loanId}/approve`, {});
  }

  rejectLoan(loanId: string): Observable<Loan> {
    return this.http.put<Loan>(`${this.API_URL}/${loanId}/reject`, {});
  }

  calculateEmi(loanId: string): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/${loanId}/emi`);
  }
}