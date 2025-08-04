import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Notification, NotificationRequest } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  sendEmailNotification(request: NotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(`${this.API_URL}/send-email`, request);
  }

  sendSmsNotification(request: NotificationRequest): Observable<Notification> {
    return this.http.post<Notification>(`${this.API_URL}/send-sms`, request);
  }

  getNotificationsByUserId(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.API_URL}/user/${userId}`);
  }
}