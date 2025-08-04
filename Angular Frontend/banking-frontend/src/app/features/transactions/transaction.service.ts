// src/app/features/transactions/transaction.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TransactionResponse,
  DepositRequest,
  WithdrawRequest,
  TransferRequest, // Ensure this is the updated interface
} from '../../shared/models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private transactionsApiUrl = `${environment.apiUrl}/transactions`; // Base URL for Transaction Microservice

  constructor(private http: HttpClient) { }

  /**
   * Deposits funds into an account.
   * POST /transactions/deposit
   * @param request The deposit request payload.
   * @returns An Observable of the created TransactionResponse.
   */
  depositFunds(request: DepositRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.transactionsApiUrl}/deposit`, request);
  }

  /**
   * Withdraws funds from an account.
   * POST /transactions/withdraw
   * @param request The withdrawal request payload.
   * @returns An Observable of the created TransactionResponse.
   */
  withdrawFunds(request: WithdrawRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.transactionsApiUrl}/withdraw`, request);
  }

  /**
   * Transfers funds between accounts.
   * POST /transactions/transfer
   * @param request The transfer request payload.
   * @returns An Observable of the created TransactionResponse.
   */
  transferFunds(request: TransferRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.transactionsApiUrl}/transfer`, request);
  }

  /**
   * Retrieves transaction history for a specific account.
   * GET /transactions/account/{accountId}
   * @param accountId The ID of the account.
   * @returns An Observable of a list of TransactionResponse.
   */
  getTransactionsByAccountId(accountId: string): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${this.transactionsApiUrl}/account/${accountId}`);
  }

  /**
   * Retrieves a specific transaction by its ID.
   * GET /transactions/{transactionId}
   * @param transactionId The ID of the transaction.
   * @returns An Observable of the TransactionResponse.
   */
  getTransactionById(transactionId: string): Observable<TransactionResponse> {
    return this.http.get<TransactionResponse>(`${this.transactionsApiUrl}/${transactionId}`);
  }
}