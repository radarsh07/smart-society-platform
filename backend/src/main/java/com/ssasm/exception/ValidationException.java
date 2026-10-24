package com.ssasm.exception;

import org.springframework.http.HttpStatus;

/**
 * Signals validation failures that should be returned as structured errors.
 */
public class ValidationException extends ApplicationException {

  public ValidationException(String message) {
    super("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST);
  }
}
