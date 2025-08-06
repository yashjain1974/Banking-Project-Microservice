package com.notification.event;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published when a loan application's status is updated.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanStatusUpdatedEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String loanId;
    private String userId;
    private String oldStatus;
    private String newStatus;
    private Double loanAmount;
    private String loanType;
    private LocalDateTime timestamp;
    private String message;
}