package com.ssasm.exception;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.ssasm.response.ErrorResponse;
import com.ssasm.response.ValidationErrorResponse;

/**
 * Centralized exception handling for predictable API error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ApplicationException.class)
  public ResponseEntity<ErrorResponse> handleApplicationException(
      ApplicationException exception,
      HttpServletRequest request) {
    ErrorResponse response = ErrorResponse.builder()
        .errorCode(exception.getErrorCode())
        .message(exception.getMessage())
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();
    return ResponseEntity.status(exception.getHttpStatus()).body(response);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ValidationErrorResponse> handleMethodArgumentNotValidException(
      MethodArgumentNotValidException exception,
      HttpServletRequest request) {
    List<ValidationErrorResponse.FieldErrorDetail> fieldErrors = exception.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(this::toFieldErrorDetail)
        .toList();

    ValidationErrorResponse response = ValidationErrorResponse.builder()
        .message("Validation failed")
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .fieldErrors(fieldErrors)
        .build();
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ValidationErrorResponse> handleConstraintViolationException(
      ConstraintViolationException exception,
      HttpServletRequest request) {
    List<ValidationErrorResponse.FieldErrorDetail> fieldErrors = exception.getConstraintViolations()
        .stream()
        .map(violation -> ValidationErrorResponse.FieldErrorDetail.builder()
            .field(violation.getPropertyPath().toString())
            .rejectedValue(String.valueOf(violation.getInvalidValue()))
            .message(violation.getMessage())
            .build())
        .toList();

    ValidationErrorResponse response = ValidationErrorResponse.builder()
        .message("Validation failed")
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .fieldErrors(fieldErrors)
        .build();
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }

  @ExceptionHandler({
      org.springframework.dao.DataAccessException.class,
      java.sql.SQLException.class,
      org.hibernate.HibernateException.class
  })
  public ResponseEntity<ErrorResponse> handleDatabaseExceptions(
      Exception exception,
      HttpServletRequest request) {
    ErrorResponse response = ErrorResponse.builder()
        .errorCode("DATABASE_UNAVAILABLE")
        .message("Database service is currently unreachable. Please verify that your cloud MySQL database is active.")
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleUnexpectedException(
      Exception exception,
      HttpServletRequest request) {
    exception.printStackTrace();
    ErrorResponse response = ErrorResponse.builder()
        .errorCode("INTERNAL_SERVER_ERROR")
        .message(exception.getMessage() != null ? exception.getMessage() : "An unexpected error occurred")
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
  }

  private ValidationErrorResponse.FieldErrorDetail toFieldErrorDetail(FieldError fieldError) {
    return ValidationErrorResponse.FieldErrorDetail.builder()
        .field(fieldError.getField())
        .rejectedValue(fieldError.getRejectedValue() == null ? null : String.valueOf(fieldError.getRejectedValue()))
        .message(fieldError.getDefaultMessage())
        .build();
  }
}
