package com.notification.dto;

import java.time.LocalDateTime;

import com.notification.model.NotificationStatus;
import com.notification.model.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor; // Import the enum from the model

/**
 * DTO for responses from the Notification Service.
 * This represents the data returned after a notification operation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String notificationId;
    private String userId;
    private NotificationType type;
    private String content;
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private String message; // Optional: A friendly message about the operation result
}