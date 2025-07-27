package com.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDto {
	 private String userId;
	    private NotificationType type;    
	    private String content; // The message to be sent

	    // Enum definitions for NotificationType
	    public enum NotificationType {
	        EMAIL,
	        SMS,
	        IN_APP, 
	        PUSH    
	    }
}