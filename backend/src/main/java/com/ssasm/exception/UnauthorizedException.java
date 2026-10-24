package com.ssasm.exception;

import org.springframework.http.HttpStatus;

/**
 * Raised when credentials are invalid or authentication is required.
 */
public class UnauthorizedException extends ApplicationException {

  public UnauthorizedException(String message) {
    super("UNAUTHORIZED", message, HttpStatus.UNAUTHORIZED);
  }
}
