package com.notification.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.notification.model.Notification;
import com.notification.model.NotificationStatus;
import com.notification.model.NotificationType;

@Repository // Marks this interface as a Spring Data JPA repository component
public interface NotificationRepository extends JpaRepository<Notification, String> {
    // JpaRepository provides standard CRUD operations: save, findById, findAll, delete, etc.
    // The 'String' parameter specifies the type of the primary key (notificationId is String)

    /**
     * Finds all notifications for a specific user ID.
     * @param userId The ID of the user to retrieve notifications for.
     * @return A list of Notification entities.
     */
    List<Notification> findByUserId(String userId);

    /**
     * Finds all notifications of a specific type (e.g., EMAIL, SMS).
     * @param type The type of notification.
     * @return A list of Notification entities.
     */
    List<Notification> findByType(NotificationType type);

    /**
     * Finds all notifications with a specific status (e.g., SENT, FAILED).
     * @param status The status of the notification.
     * @return A list of Notification entities.
     */
    List<Notification> findByStatus(NotificationStatus status);

    /**
     * Finds notifications for a user by their type and status.
     * @param userId The ID of the user.
     * @param type The type of notification.
     * @param status The status of the notification.
     * @return A list of Notification entities.
     */
    List<Notification> findByTypeAndStatus(NotificationType type, NotificationStatus status);

    // You can add more custom query methods as needed for your Notification Service's logic.
}
