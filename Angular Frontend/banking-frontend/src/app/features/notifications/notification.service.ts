// src/app/features/notifications/notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationResponse } from '../../shared/models/notification.model';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationsApiUrl = `${environment.apiUrl}/notifications`; // Base URL for Notification Microservice

  constructor(private http: HttpClient) { }

  /**
   * Retrieves all notifications for a specific user.
   * GET /notifications/user/{userId}
   * @param userId The ID of the user.
   * @returns An Observable of a list of NotificationResponse.
   */
  getNotificationsByUserId(userId: string): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.notificationsApiUrl}/user/${userId}`);
  }
}