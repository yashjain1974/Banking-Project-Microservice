// src/app/shared/models/notification.model.ts

export enum NotificationType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    IN_APP = 'IN_APP',
    PUSH = 'PUSH',
}

export enum NotificationStatus {
    SENT = 'SENT',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
}

// Interface mirroring backend NotificationResponse DTO
export interface NotificationResponse {
    notificationId: string;
    userId: string;
    type: NotificationType;
    content: string;
    status: NotificationStatus;
    sentAt: string; // Use string for LocalDateTime from Java
}