package com.example.notificationServices2.dto;
import lombok.Data;
@Data
public class NotificationRequest {
    private String userId;
    private String type;     // EMAIL or SMS
    private String content;
}


