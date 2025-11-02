package com.expensetracker.config;

import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.exception.UnauthorizedException;
import com.expensetracker.payload.MessageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    /*
     * CHANGE NOTE:
     * - This class centralizes mapping of known exceptions to HTTP responses.
     * - In particular, Security-related access-denied/authorization exceptions
     *   are explicitly mapped to HTTP 403 so they do not surface as 500
     *   internal-server-error responses in tests or runtime.
     * - Keep these handlers lightweight and only map broad exception types
     *   here; business-specific errors should use dedicated exception types.
     */

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> resourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        MessageResponse messageResponse = new MessageResponse(ex.getMessage());
        return new ResponseEntity<>(messageResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> unauthorizedException(UnauthorizedException ex, WebRequest request) {
        MessageResponse messageResponse = new MessageResponse(ex.getMessage());
        return new ResponseEntity<>(messageResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler({org.springframework.security.access.AccessDeniedException.class,
            org.springframework.security.authorization.AuthorizationDeniedException.class})
    public ResponseEntity<?> accessDeniedException(Exception ex, WebRequest request) {
        MessageResponse messageResponse = new MessageResponse(ex.getMessage());
        return new ResponseEntity<>(messageResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> globalExceptionHandler(Exception ex, WebRequest request) {
        // If this is a Spring Security access-denied type that slipped through, map to 403
        try {
            if (ex instanceof org.springframework.security.access.AccessDeniedException ||
                    ex instanceof org.springframework.security.authorization.AuthorizationDeniedException) {
                MessageResponse messageResponse = new MessageResponse(ex.getMessage());
                return new ResponseEntity<>(messageResponse, HttpStatus.FORBIDDEN);
            }
        } catch (NoClassDefFoundError ignore) {
            // ignore if those security classes are not available in some test environments
        }

        MessageResponse messageResponse = new MessageResponse(ex.getMessage());
        return new ResponseEntity<>(messageResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
