package com.example.edupulse_backend.exception;

import com.example.edupulse_backend.payload.response.ResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ResponseDto> handleValidationError(ValidationException ex) {
        log.error("Validation error: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ResponseDto(true, ex.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ResponseDto> handleInvalidRequestBody(HttpMessageNotReadableException ex) {
        log.error("Invalid request body: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ResponseDto(true, "Invalid request body format"));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ResponseDto> handleBadCredentials(BadCredentialsException ex) {
        log.error("Authentication failed: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(new ResponseDto(true, "Invalid username or password"));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ResponseDto> handleAuthenticationError(AuthenticationException ex) {
        log.error("Authentication error: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(new ResponseDto(true, "Authentication failed: " + ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ResponseDto> handleResourceNotFound(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(new ResponseDto(true, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDto> handleGenericError(Exception ex) {
        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ResponseDto(true, "An unexpected error occurred"));
    }
}
