package com.transaction.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * General exception for failures during transaction processing that are not
 * specifically account not found or insufficient funds. This can cover
 * issues with external service calls or unexpected internal errors.
 * Maps to HTTP 500 Internal Server Error (or can be customized).
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class TransactionProcessingException extends RuntimeException {
    public TransactionProcessingException(String message) {
        super(message);
    }

    public TransactionProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}