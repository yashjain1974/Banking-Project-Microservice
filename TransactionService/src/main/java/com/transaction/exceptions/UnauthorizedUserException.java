package com.transaction.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for when a user is authenticated but not authorized to perform
 * an action due to reasons like unverified KYC status.
 * Maps to HTTP 403 Forbidden or 400 Bad Request.
 */
@ResponseStatus(HttpStatus.FORBIDDEN) // Or HttpStatus.BAD_REQUEST depending on desired response
public class UnauthorizedUserException extends RuntimeException {
    public UnauthorizedUserException(String message) {
        super(message);
    }

    public UnauthorizedUserException(String message, Throwable cause) {
        super(message, cause);
    }
}
