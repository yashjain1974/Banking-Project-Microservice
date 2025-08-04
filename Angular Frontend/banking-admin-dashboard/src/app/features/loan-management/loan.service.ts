// src/app/features/loan-management/loan.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoanResponse, LoanRequest, LoanStatus } from '../../shared/models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private loansApiUrl = `${environment.apiUrl}/loans`; // Base URL for Loan Microservice

  constructor(private http: HttpClient) { }

  /**
   * Retrieves all loan applications.
   * GET /loans
   * @returns An Observable of a list of LoanResponse.
   */
  getAllLoans(): Observable<LoanResponse[]> {
    return this.http.get<LoanResponse[]>(`${this.loansApiUrl}`);
  }

  /**
   * Retrieves a specific loan by its ID.
   * GET /loans/{loanId}
   * @param loanId The ID of the loan.
   * @returns An Observable of the LoanResponse.
   */
  getLoanById(loanId: string): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(`${this.loansApiUrl}/${loanId}`);
  }

  /**
   * Approves a loan application.
   * PUT /loans/{loanId}/approve
   * @param loanId The ID of the loan to approve.
   * @returns An Observable of the updated LoanResponse.
   */
  approveLoan(loanId: string): Observable<LoanResponse> {
    return this.http.put<LoanResponse>(`${this.loansApiUrl}/${loanId}/approve`, {}); // Empty body for PUT
  }

  /**
   * Rejects a loan application.
   * PUT /loans/{loanId}/reject
   * @param loanId The ID of the loan to reject.
   * @returns An Observable of the updated LoanResponse.
   */
  rejectLoan(loanId: string): Observable<LoanResponse> {
    return this.http.put<LoanResponse>(`${this.loansApiUrl}/${loanId}/reject`, {}); // Empty body for PUT
  }

  // You can add other methods like getLoansByUser, calculateEmi if needed for admin view
}