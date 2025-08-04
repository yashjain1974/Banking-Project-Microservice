import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification, NotificationType, NotificationStatus } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule
  ],
  template: `
    <div class="notifications-container">
      <div class="header">
        <h1>Notifications</h1>
        <button mat-raised-button color="primary" (click)="markAllAsRead()" 
                [disabled]="notifications.length === 0">
          <mat-icon>done_all</mat-icon>
          Mark All as Read
        </button>
      </div>
      
      <div class="notifications-list" *ngIf="notifications.length > 0; else noNotifications">
        <mat-card class="notification-card" *ngFor="let notification of notifications" 
                  [class]="getNotificationClass(notification)">
          <mat-card-content>
            <div class="notification-header">
              <div class="notification-icon">
                <mat-icon [class]="getTypeIconClass(notification.type)">
                  {{getTypeIcon(notification.type)}}
                </mat-icon>
              </div>
              <div class="notification-info">
                <div class="notification-meta">
                  <mat-chip [class]="getTypeClass(notification.type)">
                    {{notification.type}}
                  </mat-chip>
                  <mat-chip [class]="getStatusClass(notification.status)">
                    {{notification.status}}
                  </mat-chip>
                  <span class="notification-time">{{notification.sentAt | date:'short'}}</span>
                </div>
              </div>
            </div>
            
            <div class="notification-content">
              <p>{{notification.content}}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <ng-template #noNotifications>
        <mat-card class="no-notifications-card">
          <mat-card-content>
            <div class="no-notifications-content">
              <mat-icon class="no-notifications-icon">notifications</mat-icon>
              <h2>No Notifications</h2>
              <p>You're all caught up! No new notifications at this time.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .notification-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-left: 4px solid transparent;
    }
    
    .notification-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
    
    .notification-card.unread {
      border-left-color: #2196F3;
      background: #f8f9ff;
    }
    
    .notification-card.email {
      border-left-color: #4CAF50;
    }
    
    .notification-card.sms {
      border-left-color: #FF9800;
    }
    
    .notification-card.in_app {
      border-left-color: #9C27B0;
    }
    
    .notification-card.push {
      border-left-color: #f44336;
    }
    
    .notification-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 12px;
    }
    
    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .notification-icon.email {
      background: #e8f5e8;
      color: #4CAF50;
    }
    
    .notification-icon.sms {
      background: #fff3e0;
      color: #FF9800;
    }
    
    .notification-icon.in_app {
      background: #f3e5f5;
      color: #9C27B0;
    }
    
    .notification-icon.push {
      background: #ffebee;
      color: #f44336;
    }
    
    .notification-info {
      flex: 1;
    }
    
    .notification-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .notification-time {
      font-size: 12px;
      color: #666;
      margin-left: auto;
    }
    
    .notification-content {
      margin-top: 12px;
    }
    
    .notification-content p {
      margin: 0;
      color: #333;
      line-height: 1.5;
    }
    
    .type-email {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .type-sms {
      background-color: #fff3e0;
      color: #ef6c00;
    }
    
    .type-in_app {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }
    
    .type-push {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-sent {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .status-failed {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }
    
    .no-notifications-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .no-notifications-content {
      text-align: center;
      padding: 48px 24px;
    }
    
    .no-notifications-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .no-notifications-content h2 {
      color: #333;
      margin-bottom: 16px;
    }
    
    .no-notifications-content p {
      color: #666;
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .notification-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .notification-time {
        margin-left: 0;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadNotifications(user.userId);
      }
    });
  }

  private loadNotifications(userId: string): void {
    this.notificationService.getNotificationsByUserId(userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications.sort((a, b) => 
          new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
      },
      error: () => console.error('Failed to load notifications')
    });
  }

  getNotificationClass(notification: Notification): string {
    const classes = [notification.type.toLowerCase()];
    if (notification.status === NotificationStatus.PENDING) {
      classes.push('unread');
    }
    return classes.join(' ');
  }

  getTypeIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.EMAIL: return 'email';
      case NotificationType.SMS: return 'sms';
      case NotificationType.IN_APP: return 'notifications';
      case NotificationType.PUSH: return 'push_pin';
      default: return 'notifications';
    }
  }

  getTypeIconClass(type: NotificationType): string {
    return type.toLowerCase();
  }

  getTypeClass(type: NotificationType): string {
    return `type-${type.toLowerCase()}`;
  }

  getStatusClass(status: NotificationStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  markAllAsRead(): void {
    // In a real app, you'd call an API to mark notifications as read
    console.log('Mark all notifications as read');
  }
}