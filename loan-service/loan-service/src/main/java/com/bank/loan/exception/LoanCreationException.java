package com.bank.loan.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for failures during loan application creation.
 * Maps to HTTP 400 Bad Request.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class LoanCreationException extends RuntimeException {
    public LoanCreationException(String message) {
        super(message);
    }

    public LoanCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
