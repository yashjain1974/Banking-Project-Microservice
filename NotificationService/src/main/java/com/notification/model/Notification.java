package com.notification.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // Marks this class as a JPA entity, mapping it to a database table
@Data // Generates getters, setters, equals, hashCode, and toString methods
@NoArgsConstructor // Generates a no-argument constructor (required by JPA)
@AllArgsConstructor // Generates a constructor with all fields
public class Notification {

    @Id // Designates 'notificationId' as the primary key
    @GeneratedValue(strategy = GenerationType.UUID) // Using UUID for robust ID generation
    @Column(name = "notification_id", updatable = false, nullable = false)
    private String notificationId;

    @Column(name = "user_id", nullable = false)
    private String userId; // Foreign key referencing the User Service's User ID

    @Enumerated(EnumType.STRING) // Stores the enum as a string in the database
    @Column(name = "type", nullable = false)
    private NotificationType type; // Possible values: EMAIL, SMS

    @Column(name = "content", columnDefinition = "CLOB") // CLOB for potentially large text content
    private String content;

    @Enumerated(EnumType.STRING) // Stores the enum as a string in the database
    @Column(name = "status", nullable = false)
    private NotificationStatus status; // Possible values: SENT, FAILED

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    // Enums for NotificationType and NotificationStatus for type safety and validation
}
