import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Transaction, DepositRequest, WithdrawRequest, TransferRequest } from '../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly API_URL = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  deposit(request: DepositRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_URL}/deposit`, request);
  }

  withdraw(request: WithdrawRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_URL}/withdraw`, request);
  }

  transfer(request: TransferRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_URL}/transfer`, request);
  }

  getTransactionsByAccountId(accountId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.API_URL}/account/${accountId}`);
  }

  getTransactionById(transactionId: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API_URL}/${transactionId}`);
  }
}