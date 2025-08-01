package com.accountMicroservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * General exception for failures during account processing that are not
 * specifically covered by other exceptions (e.g., external service call failures).
 * Maps to HTTP 500 Internal Server Error.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class AccountProcessingException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public AccountProcessingException(String message) {
        super(message);
    }

    public AccountProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}