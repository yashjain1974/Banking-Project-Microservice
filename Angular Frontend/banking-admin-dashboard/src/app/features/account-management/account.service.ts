// banking-admin-dashboard/src/app/features/account-management/account.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AccountResponse,
  AccountStatus,
  AccountUpdateRequest
} from '../../shared/models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountsApiUrl = `${environment.apiUrl}/accounts`; // Base URL for Account Microservice

  constructor(private http: HttpClient) { }

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
   * Retrieves account details by account number.
   * GET /accounts/number/{accountNumber}
   * @param accountNumber The account number.
   * @returns An Observable of the AccountResponse.
   */
  getAccountByAccountNumber(accountNumber: string): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.accountsApiUrl}/number/${accountNumber}`);
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
   * Updates the status of an account (e.g., ACTIVE to CLOSED/BLOCKED).
   * PUT /accounts/{accountId}
   * @param accountId The ID of the account to update.
   * @param status The new status (AccountStatus.BLOCKED, AccountStatus.ACTIVE, AccountStatus.CLOSED).
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
}