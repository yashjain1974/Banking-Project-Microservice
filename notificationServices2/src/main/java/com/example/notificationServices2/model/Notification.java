package com.example.notificationServices2.model;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

        import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String notificationId;

    private String userId;

    private String type; // EMAIL or SMS

    private String content;

    private String status; // SENT or FAILED

    private LocalDateTime sentAt;
}

