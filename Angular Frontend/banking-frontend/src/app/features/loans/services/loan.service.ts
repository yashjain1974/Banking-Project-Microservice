import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LoanRequest } from '../../../shared/models/loan-request.model';
import { LoanResponse } from '../../../shared/models/loan-response.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = environment.apiUrl + '/loans';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    console.log('Token:', token);
    // const token = "add_token_here"
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  applyLoan(loan: LoanRequest): Observable<LoanResponse> {
    return this.http.post<LoanResponse>(
      `${this.apiUrl}/apply`,
      loan,
      { headers: this.getHeaders() }
    );
  }

  getLoans(): Observable<LoanResponse[]> {
    return this.http.get<LoanResponse[]>(
      `${this.apiUrl}`,
      { headers: this.getHeaders() }
    );
  }

  getLoansByUser(userId: string): Observable<LoanResponse[]> {
    return this.http.get<LoanResponse[]>(
      `${this.apiUrl}/user/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  getLoanById(loanId: string): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(
      `${this.apiUrl}/${loanId}`,
      { headers: this.getHeaders() }
    );
  }

  approveLoan(loanId: string): Observable<LoanResponse> {
    return this.http.put<LoanResponse>(
      `${this.apiUrl}/${loanId}/approve`,
      {}, // Empty body
      { headers: this.getHeaders() }
    );
  }

  rejectLoan(loanId: string): Observable<LoanResponse> {
    return this.http.put<LoanResponse>(
      `${this.apiUrl}/${loanId}/reject`,
      {}, // Empty body
      { headers: this.getHeaders() }
    );
  }

  calculateEmi(loanId: string): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/${loanId}/emi`,
      { headers: this.getHeaders() }
    );
  }

}
