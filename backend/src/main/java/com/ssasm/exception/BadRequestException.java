package com.ssasm.exception;

import org.springframework.http.HttpStatus;

/**
 * Signals a client-side validation or request formatting problem.
 */
public class BadRequestException extends ApplicationException {

  public BadRequestException(String message) {
    super("BAD_REQUEST", message, HttpStatus.BAD_REQUEST);
  }
}
