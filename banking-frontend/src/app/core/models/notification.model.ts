export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  content: string;
  status: NotificationStatus;
  sentAt: string;
}

export interface NotificationRequest {
  userId: string;
  type: NotificationType;
  content: string;
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH'
}

export enum NotificationStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}