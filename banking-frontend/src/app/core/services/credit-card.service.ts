import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreditCard, CreditCardRequest } from '../models/credit-card.model';
import { Transaction } from '../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CreditCardService {
  private readonly API_URL = `${environment.apiUrl}/cards`;

  constructor(private http: HttpClient) {}

  issueCard(request: CreditCardRequest): Observable<CreditCard> {
    return this.http.post<CreditCard>(`${this.API_URL}/issue`, request);
  }

  getCardsByUserId(userId: string): Observable<CreditCard[]> {
    return this.http.get<CreditCard[]>(`${this.API_URL}/user/${userId}`);
  }

  getCardById(cardId: string): Observable<CreditCard> {
    return this.http.get<CreditCard>(`${this.API_URL}/${cardId}`);
  }

  blockCard(cardId: string): Observable<CreditCard> {
    return this.http.put<CreditCard>(`${this.API_URL}/${cardId}/block`, {});
  }

  unblockCard(cardId: string): Observable<CreditCard> {
    return this.http.put<CreditCard>(`${this.API_URL}/${cardId}/unblock`, {});
  }

  updateTransactionLimit(cardId: string, newLimit: number): Observable<CreditCard> {
    return this.http.put<CreditCard>(`${this.API_URL}/${cardId}/limit?newLimit=${newLimit}`, {});
  }

  getTransactionsByCardId(cardId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.API_URL}/${cardId}/transactions`);
  }
}