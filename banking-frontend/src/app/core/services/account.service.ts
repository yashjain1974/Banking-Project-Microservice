import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Account, AccountCreationRequest, AccountUpdateRequest } from '../models/account.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly API_URL = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  createAccount(request: AccountCreationRequest): Observable<Account> {
    return this.http.post<Account>(`${this.API_URL}/create`, request);
  }

  getAccountsByUserId(userId: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_URL}/user/${userId}`);
  }

  getAccountById(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.API_URL}/${accountId}`);
  }

  updateAccountStatus(accountId: string, request: AccountUpdateRequest): Observable<Account> {
    return this.http.put<Account>(`${this.API_URL}/${accountId}`, request);
  }

  deleteAccount(accountId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${accountId}`);
  }

  depositFunds(accountId: string, amount: number): Observable<Account> {
    return this.http.post<Account>(`${this.API_URL}/${accountId}/deposit`, {
      transactionId: this.generateTransactionId(),
      amount
    });
  }

  withdrawFunds(accountId: string, amount: number): Observable<Account> {
    return this.http.post<Account>(`${this.API_URL}/${accountId}/withdraw`, {
      transactionId: this.generateTransactionId(),
      amount
    });
  }

  private generateTransactionId(): string {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}