// src/app/features/loans/loan.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoanResponse, LoanRequest } from '../../shared/models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private loansApiUrl = `${environment.apiUrl}/loans`; // Base URL for Loan Microservice

  constructor(private http: HttpClient) { }

  /**
   * Allows a user to apply for a new loan.
   * POST /loans/apply
   * @param request The loan application request payload.
   * @returns An Observable of the created LoanResponse.
   */
  applyForLoan(request: LoanRequest): Observable<LoanResponse> {
    return this.http.post<LoanResponse>(`${this.loansApiUrl}/apply`, request);
  }

  /**
   * Retrieves all loan applications for a specific user.
   * GET /loans/user/{userId}
   * @param userId The ID of the user.
   * @returns An Observable of a list of LoanResponse.
   */
  getLoansByUserId(userId: string): Observable<LoanResponse[]> {
    return this.http.get<LoanResponse[]>(`${this.loansApiUrl}/user/${userId}`);
  }

  /**
   * Retrieves details of a specific loan by its ID.
   * GET /loans/{loanId}
   * @param loanId The ID of the loan.
   * @returns An Observable of the LoanResponse.
   */
  getLoanById(loanId: string): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(`${this.loansApiUrl}/${loanId}`);
  }

  /**
   * Calculates the EMI for a specific loan.
   * GET /loans/{loanId}/emi
   * @param loanId The ID of the loan.
   * @returns An Observable of the calculated EMI amount (number).
   */
  calculateEmi(loanId: string): Observable<number> {
    return this.http.get<number>(`${this.loansApiUrl}/${loanId}/emi`);
  }

  // Admin-specific methods (if this service is shared with admin dashboard, otherwise create separate)
  // getAllLoans(): Observable<LoanResponse[]> {
  //   return this.http.get<LoanResponse[]>(`${this.loansApiUrl}`);
  // }
  // approveLoan(loanId: string): Observable<LoanResponse> {
  //   return this.http.put<LoanResponse>(`${this.loansApiUrl}/${loanId}/approve`, {});
  // }
  // rejectLoan(loanId: string): Observable<LoanResponse> {
  //   return this.http.put<LoanResponse>(`${this.loansApiUrl}/${loanId}/reject`, {});
  // }
}