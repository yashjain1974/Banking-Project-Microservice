package com.notification.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.notification.dto.NotificationRequest;
import com.notification.dto.NotificationResponse;
import com.notification.exceptions.NotificationProcessingException;
import com.notification.model.Notification;
import com.notification.model.NotificationType;
import com.notification.service.NotificationService;

import jakarta.validation.Valid; // For input validation

@RestController // Marks this class as a REST controller
@RequestMapping("/notifications") // Base path for all endpoints in this controller
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired // Injects the NotificationService implementation
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Handles POST /notifications/send-email requests.
     * Sends an email notification.
     *
     * @param request The NotificationRequest DTO containing userId and content.
     * The type will be implicitly set to EMAIL.
     * @return ResponseEntity with the NotificationResponse and HTTP status 201 (Created).
     * @throws NotificationProcessingException if there's an issue sending the email.
     */
    @PostMapping("/send-email")
    public ResponseEntity<NotificationResponse> sendEmailNotification(@Valid @RequestBody NotificationRequest request) {
        // Ensure the request type is EMAIL, even if not explicitly set by client (or override if client sets it)
        request.setType(NotificationType.EMAIL);
        NotificationResponse response = notificationService.sendNotification(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Handles POST /notifications/send-sms requests.
     * Sends an SMS notification.
     *
     * @param request The NotificationRequest DTO containing userId and content.
     * The type will be implicitly set to SMS.
     * @return ResponseEntity with the NotificationResponse and HTTP status 201 (Created).
     * @throws NotificationProcessingException if there's an issue sending the SMS.
     */
    @PostMapping("/send-sms")
    public ResponseEntity<NotificationResponse> sendSmsNotification(@Valid @RequestBody NotificationRequest request) {
        // Ensure the request type is SMS
        request.setType(NotificationType.SMS);
        NotificationResponse response = notificationService.sendNotification(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Handles GET /notifications/user/{id} requests.
     * Retrieves all notifications for a specific user.
     *
     * @param userId The ID of the user.
     * @return ResponseEntity with a list of Notification entities and HTTP status 200 (OK).
     * Returns 204 No Content if no notifications are found for the user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsForUser(@PathVariable String userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        if (notifications.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    // You might also want endpoints for retrieving by notificationId, type, status, etc.,
    // as defined in your NotificationService interface.
    // Example:
    /*
    @GetMapping("/{notificationId}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable String notificationId) {
        Optional<Notification> notification = notificationService.getNotificationById(notificationId);
        return notification.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                          .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    */
}