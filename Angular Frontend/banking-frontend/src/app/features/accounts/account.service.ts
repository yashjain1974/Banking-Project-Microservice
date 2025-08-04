// src/app/features/accounts/account.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccountCreationRequest, AccountResponse, AccountStatus, AccountUpdateRequest, DepositRequest, WithdrawRequest } from '../../shared/models/account.model';




@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountsApiUrl = `${environment.apiUrl}/accounts`; // Base URL for Account Microservice

  constructor(private http: HttpClient) { }

  /**
   * Creates a new bank account.
   * POST /accounts/create
   * @param request The account creation request payload.
   * @returns An Observable of the created AccountResponse.
   */
  createAccount(request: AccountCreationRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.accountsApiUrl}/create`, request);
  }

  /**
   * Retrieves all accounts associated with a specific user ID.
   * GET /accounts/user/{userId}
   * @param userId The ID of the user.
   * @returns An Observable of a list of AccountResponse.
   */
  getAccountsByUserId(userId: string): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(`${this.accountsApiUrl}/user/${userId}`);
  }

  /**
   * Retrieves account details by account ID.
   * GET /accounts/{accountId}
   * @param accountId The ID of the account.
   * @returns An Observable of the AccountResponse.
   */
  getAccountById(accountId: string): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.accountsApiUrl}/${accountId}`);
  }

  /**
   * Updates the status of an account (e.g., ACTIVE to CLOSED).
   * PUT /accounts/{accountId}
   * @param accountId The ID of the account to update.
   * @param status The new status (e.g., AccountStatus.CLOSED).
   * @returns An Observable of the updated AccountResponse.
   */
  updateAccountStatus(accountId: string, status: AccountStatus): Observable<AccountResponse> {
    const request: AccountUpdateRequest = { status: status };
    return this.http.put<AccountResponse>(`${this.accountsApiUrl}/${accountId}`, request);
  }

  /**
   * Deletes or closes an account.
   * DELETE /accounts/{accountId}
   * @param accountId The ID of the account to delete.
   * @returns An Observable of void.
   */
  deleteAccount(accountId: string): Observable<void> {
    return this.http.delete<void>(`${this.accountsApiUrl}/${accountId}`);
  }

  /**
   * Deposits funds into a specified account (internal endpoint for backend services).
   * POST /accounts/{accountId}/deposit
   * @param accountId The ID of the account.
   * @param request The deposit request payload (transactionId, amount).
   * @returns An Observable of the updated AccountResponse.
   */
  depositFunds(accountId: string, request: DepositRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.accountsApiUrl}/${accountId}/deposit`, request);
  }

  /**
   * Withdraws funds from a specified account (internal endpoint for backend services).
   * POST /accounts/{accountId}/withdraw
   * @param accountId The ID of the account.
   * @param request The withdrawal request payload (transactionId, amount).
   * @returns An Observable of the updated AccountResponse.
   */
  withdrawFunds(accountId: string, request: WithdrawRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.accountsApiUrl}/${accountId}/withdraw`, request);
  }
}