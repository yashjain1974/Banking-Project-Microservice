// src/app/features/cards/card.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CardResponse,
  CardRequest,
  CardStatus // Import CardStatus for update methods
} from '../../shared/models/card.model';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private cardsApiUrl = `${environment.apiUrl}/cards`; // Base URL for Card Microservice

  constructor(private http: HttpClient) { }

  /**
   * Issues a new card.
   * POST /cards/issue
   * @param request The card issuance request payload.
   * @returns An Observable of the created CardResponse.
   */
  issueCard(request: CardRequest): Observable<CardResponse> {
    return this.http.post<CardResponse>(`${this.cardsApiUrl}/issue`, request);
  }

  /**
   * Retrieves all cards for a specific user.
   * GET /cards/user/{userId}
   * @param userId The ID of the user.
   * @returns An Observable of a list of CardResponse.
   */
  getCardsByUserId(userId: string): Observable<CardResponse[]> {
    return this.http.get<CardResponse[]>(`${this.cardsApiUrl}/user/${userId}`);
  }

  /**
   * Retrieves a card by its ID.
   * GET /cards/{cardId}
   * @param cardId The ID of the card.
   * @returns An Observable of the CardResponse.
   */
  getCardById(cardId: string): Observable<CardResponse> {
    return this.http.get<CardResponse>(`${this.cardsApiUrl}/${cardId}`);
  }

  /**
   * Blocks a card.
   * PUT /cards/{cardId}/block
   * @param cardId The ID of the card to block.
   * @returns An Observable of the updated CardResponse.
   */
  blockCard(cardId: string): Observable<CardResponse> {
    return this.http.put<CardResponse>(`${this.cardsApiUrl}/${cardId}/block`, {}); // Empty body
  }

  /**
   * Unblocks a card.
   * PUT /cards/{cardId}/unblock
   * @param cardId The ID of the card to unblock.
   * @returns An Observable of the updated CardResponse.
   */
  unblockCard(cardId: string): Observable<CardResponse> {
    return this.http.put<CardResponse>(`${this.cardsApiUrl}/${cardId}/unblock`, {}); // Empty body
  }

  /**
   * Updates the transaction limit for a card.
   * PUT /cards/{cardId}/limit
   * @param cardId The ID of the card.
   * @param newLimit The new transaction limit.
   * @returns An Observable of the updated CardResponse.
   */
  updateTransactionLimit(cardId: string, newLimit: number): Observable<CardResponse> {
    // Backend expects @RequestParam, but for PUT, a body is often sent.
    // If backend expects @RequestParam, you might need to adjust this.
    // Assuming backend can handle it as a request param or simple body.
    return this.http.put<CardResponse>(`${this.cardsApiUrl}/${cardId}/limit?newLimit=${newLimit}`, {});
  }

  // Note: getTransactionsByCardId is in the TransactionService (backend)
  // If frontend needs to display card transactions, it would call TransactionService directly.
}