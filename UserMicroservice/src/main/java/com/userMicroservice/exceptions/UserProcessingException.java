package com.userMicroservice.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * General exception for failures during user profile processing that are not
 * specifically covered by other exceptions (e.g., unexpected internal errors).
 * Maps to HTTP 500 Internal Server Error.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class UserProcessingException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public UserProcessingException(String message) {
        super(message);
    }

    public UserProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
