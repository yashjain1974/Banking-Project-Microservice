package com.notification.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.notification.exceptions.NotificationProcessingException; // Custom exception for this service
import com.notification.dao.NotificationRepository;
import com.notification.dto.NotificationRequest;
import com.notification.dto.NotificationResponse;
import com.notification.model.Notification;
import com.notification.model.NotificationStatus;
import com.notification.model.NotificationType;

@Service // Marks this class as a Spring service component
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Sends a notification based on the provided request.
     * This method will persist the notification record and simulate sending it.
     *
     * @param request The NotificationRequest DTO containing details like userId, type, and content.
     * @return A NotificationResponse DTO indicating the result of the operation.
     * @throws NotificationProcessingException if there's an issue processing or sending the notification.
     */
    @Override
    @Transactional // Ensures the database operation is atomic
    public NotificationResponse sendNotification(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setType(request.getType());
        notification.setContent(request.getContent());
        notification.setSentAt(LocalDateTime.now());
        notification.setStatus(NotificationStatus.PENDING); // Start as PENDING

        NotificationResponse response = new NotificationResponse();
        response.setUserId(request.getUserId());
        response.setType(request.getType());
        response.setContent(request.getContent());
        response.setSentAt(notification.getSentAt());

        try {
            // Simulate sending the notification (e.g., call to an external SMS/Email gateway)
            // In a real application, this would involve integrating with a third-party API
            // or a message queue (e.g., Kafka, RabbitMQ) for asynchronous processing.
            // For now, we'll just log it.
            System.out.println("Simulating sending " + request.getType() + " notification to user " + request.getUserId() + ": " + request.getContent());

            // Assuming successful sending for this simulation
            notification.setStatus(NotificationStatus.SENT);
            notification = notificationRepository.save(notification); // Save with SENT status

            response.setNotificationId(notification.getNotificationId());
            response.setStatus(NotificationStatus.SENT);
            response.setMessage("Notification sent successfully.");

        } catch (Exception e) {
            // If sending fails (e.g., network error to external gateway)
            notification.setStatus(NotificationStatus.FAILED);
            notification = notificationRepository.save(notification); // Save with FAILED status

            response.setNotificationId(notification.getNotificationId());
            response.setStatus(NotificationStatus.FAILED);
            response.setMessage("Failed to send notification: " + e.getMessage());

            // Re-throw a custom exception to be handled by a GlobalExceptionHandler
            throw new NotificationProcessingException("Failed to send notification for user " + request.getUserId(), e);
        }
        return response;
    }

    /**
     * Retrieves a notification by its unique ID.
     *
     * @param notificationId The ID of the notification.
     * @return An Optional containing the Notification entity if found, or empty otherwise.
     */
    @Override
    public Optional<Notification> getNotificationById(String notificationId) {
        return notificationRepository.findById(notificationId);
    }

    /**
     * Retrieves all notifications for a specific user.
     *
     * @param userId The ID of the user.
     * @return A list of Notification entities.
     */
    @Override
    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    /**
     * Retrieves notifications by their type and status.
     *
     * @param type The type of notification (e.g., EMAIL, SMS).
     * @param status The status of the notification (e.g., SENT, FAILED).
     * @return A list of Notification entities.
     */
    @Override
    public List<Notification> getNotificationsByTypeAndStatus(NotificationType type, NotificationStatus status) {
        // Corrected: Calling findByTypeAndStatus as per the method signature
        return notificationRepository.findByTypeAndStatus(type, status);
    }
}
