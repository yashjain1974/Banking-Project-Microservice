package com.notification.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener; // Import KafkaListener
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Ensure transactional context if needed

import com.notification.dao.NotificationRepository;
import com.notification.dto.NotificationRequest;
import com.notification.dto.NotificationResponse;
import com.notification.dto.TransactionCompletedEvent;
import com.notification.model.Notification;
import com.notification.model.NotificationStatus;
import com.notification.model.NotificationType;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Kafka Listener method to consume TransactionCompletedEvent messages.
     * This method is triggered when a new message arrives in the 'transaction-events' topic.
     *
     * @param event The TransactionCompletedEvent DTO received from Kafka.
     */
    @KafkaListener(topics = "transaction-events", groupId = "notification-service-group", containerFactory = "kafkaListenerContainerFactory")
    // 'transaction-events' is the topic name, 'notification-service-group' is the consumer group ID
    public void listenTransactionEvents(TransactionCompletedEvent event) {
        System.out.println("Notification Service: Received transaction event from Kafka: " + event.getTransactionId());
        System.out.println("Event Details: User=" + event.getUserId() + ", Amount=" + event.getAmount() + ", Type=" + event.getType());

        // Now, use the received event data to send the actual notification
        // You can map this to your existing NotificationRequest DTO
        NotificationRequest notificationRequest = new NotificationRequest();
        notificationRequest.setUserId(event.getUserId());
        // Determine notification type based on event details (e.g., always EMAIL for transaction alerts)
        notificationRequest.setType(NotificationType.EMAIL);
        notificationRequest.setContent(event.getNotificationMessage());

        // Call the internal sendNotification logic
        // Note: This internal call should ideally not throw exceptions that stop the Kafka consumer.
        // Handle exceptions gracefully or use a Dead Letter Queue (DLQ) for failed messages.
        try {
            // We'll call the existing sendNotification method, but adapt it slightly if it's transactional
            // or if it needs to return a response. For Kafka, we primarily care about processing the event.
            sendNotificationInternal(notificationRequest); // Use an internal helper method
            System.out.println("Notification sent for transaction: " + event.getTransactionId());
        } catch (Exception e) {
            System.err.println("Error processing Kafka event for transaction " + event.getTransactionId() + ": " + e.getMessage());
            // Log the error. For production, consider sending to a DLQ or alerting.
        }
    }

    /**
     * Internal helper method to encapsulate notification sending logic,
     * adapted for Kafka consumption.
     * @param request The NotificationRequest DTO.
     * @return A NotificationResponse DTO (optional, for internal use).
     */
    @Transactional // Ensure the database operation is atomic
    private NotificationResponse sendNotificationInternal(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setType(request.getType());
        notification.setContent(request.getContent());
        notification.setSentAt(LocalDateTime.now());
        notification.setStatus(NotificationStatus.PENDING);

        NotificationResponse response = new NotificationResponse();
        response.setUserId(request.getUserId());
        response.setType(request.getType());
        response.setContent(request.getContent());
        response.setSentAt(notification.getSentAt());

        try {
            System.out.println("Simulating sending " + request.getType() + " notification to user " + request.getUserId() + " via Kafka event: " + request.getContent());
            notification.setStatus(NotificationStatus.SENT);
            notification = notificationRepository.save(notification);

            response.setNotificationId(notification.getNotificationId());
            response.setStatus(NotificationStatus.SENT);
            response.setMessage("Notification sent successfully.");

        } catch (Exception e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification = notificationRepository.save(notification);

            response.setNotificationId(notification.getNotificationId());
            response.setStatus(NotificationStatus.FAILED);
            response.setMessage("Failed to send notification: " + e.getMessage());

            // For Kafka consumers, typically you log and potentially send to a Dead Letter Topic
            // rather than re-throwing, to avoid stopping the consumer or infinite retries.
            System.err.println("Notification processing failed for user " + request.getUserId() + ": " + e.getMessage());
        }
        return response;
    }

    // --- Existing methods (getNotificationById, getNotificationsByUserId, getNotificationsByTypeAndStatus) ---
    // Keep your existing public API methods as they are for direct calls.

    @Override
    public NotificationResponse sendNotification(NotificationRequest request) {
        // This method will now be called by the Controller for direct API calls,
        // or you can remove it if all notifications are event-driven.
        // For now, keep it as it might be used by other services directly.
        return sendNotificationInternal(request);
    }

    @Override
    public Optional<Notification> getNotificationById(String notificationId) {
        return notificationRepository.findById(notificationId);
    }

    @Override
    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public List<Notification> getNotificationsByTypeAndStatus(NotificationType type, NotificationStatus status) {
        return notificationRepository.findByTypeAndStatus(type, status);
    }
}