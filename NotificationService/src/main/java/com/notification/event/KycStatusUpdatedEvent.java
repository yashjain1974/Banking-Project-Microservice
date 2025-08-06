package com.notification.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Event published when a user's KYC status is updated.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KycStatusUpdatedEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String userId;
    private String username;
    private String email;
    private String oldKycStatus;
    private String newKycStatus;
    private LocalDateTime timestamp;
    private String message;
}