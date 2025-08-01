package com.notification.service;

import java.util.List;
import java.util.Optional;

import com.notification.dto.NotificationRequest;
import com.notification.dto.NotificationResponse;
import com.notification.model.Notification;
import com.notification.model.NotificationStatus;
import com.notification.model.NotificationType;

/**
 * Interface for the Notification Service, defining the core business operations
 * related to sending and managing notifications.
 */
public interface NotificationService {

    /**
     * Sends a notification based on the provided request.
     * This method will persist the notification record and simulate sending it.
     *
     * @param request The NotificationRequest DTO containing details like userId, type, and content.
     * @return A NotificationResponse DTO indicating the result of the operation.
     * @throws NotificationProcessingException if there's an issue processing or sending the notification.
     */
    NotificationResponse sendNotification(NotificationRequest request);

    /**
     * Retrieves a notification by its unique ID.
     *
     * @param notificationId The ID of the notification.
     * @return An Optional containing the Notification entity if found, or empty otherwise.
     */
    Optional<Notification> getNotificationById(String notificationId);

    /**
     * Retrieves all notifications for a specific user.
     *
     * @param userId The ID of the user.
     * @return A list of Notification entities.
     */
    List<Notification> getNotificationsByUserId(String userId);

    /**
     * Retrieves notifications by their type and status.
     *
     * @param type The type of notification (e.g., EMAIL, SMS).
     * @param status The status of the notification (e.g., SENT, FAILED).
     * @return A list of Notification entities.
     */
    List<Notification> getNotificationsByTypeAndStatus(NotificationType type, NotificationStatus status);
}