package com.notification.dto;

import com.notification.model.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for incoming requests to send a notification.
 * This defines the payload that clients will send to the Notification Service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotBlank(message = "User ID cannot be empty")
    private String userId;

    @NotNull(message = "Notification type cannot be null")
    private NotificationType type; // e.g., EMAIL, SMS, IN_APP, PUSH

    @NotBlank(message = "Notification content cannot be empty")
    private String content;
}