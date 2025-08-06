package com.userMicroservice.event;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published when a user's KYC status is updated.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KycStatusUpdatedEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String userId;
    private String username; // Include username for notification message
    private String email;    // Include email for direct notification sending
    private String oldKycStatus;
    private String newKycStatus;
    private LocalDateTime timestamp;
    private String message; // Custom message for the notification
}