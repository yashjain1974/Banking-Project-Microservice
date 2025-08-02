package com.example.notificationServices2.service;
import com.bank.notification.dto.NotificationRequest;
import com.bank.notification.model.Notification;
import com.bank.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    public Notification sendNotification(NotificationRequest request) {
        // Simulate sending email/SMS
        String status = "SENT"; // In real-world, call email/SMS service here

        Notification notification = Notification.builder()
                .notificationId(UUID.randomUUID().toString())
                .userId(request.getUserId())
                .type(request.getType())
                .content(request.getContent())
                .status(status)
                .sentAt(LocalDateTime.now())
                .build();

        return repository.save(notification);
    }
}

