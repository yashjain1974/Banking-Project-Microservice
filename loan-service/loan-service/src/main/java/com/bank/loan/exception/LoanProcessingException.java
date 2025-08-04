package com.bank.loan.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * General exception for failures during loan processing that are not
 * specifically covered by other exceptions (e.g., invalid state transitions, EMI calculation errors).
 * Maps to HTTP 500 Internal Server Error.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class LoanProcessingException extends RuntimeException {
    public LoanProcessingException(String message) {
        super(message);
    }

    public LoanProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
