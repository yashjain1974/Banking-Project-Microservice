package com.notification.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for failures during notification processing or sending.
 * Maps to HTTP 500 Internal Server Error.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class NotificationProcessingException extends RuntimeException {
    public NotificationProcessingException(String message) {
        super(message);
    }

    public NotificationProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}