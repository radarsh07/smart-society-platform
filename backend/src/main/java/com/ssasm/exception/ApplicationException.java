package com.ssasm.exception;

import org.springframework.http.HttpStatus;

/**
 * Base runtime exception for application-specific failures.
 */
public abstract class ApplicationException extends RuntimeException {

  private final String errorCode;
  private final HttpStatus httpStatus;

  protected ApplicationException(String errorCode, String message, HttpStatus httpStatus) {
    super(message);
    this.errorCode = errorCode;
    this.httpStatus = httpStatus;
  }

  public String getErrorCode() {
    return errorCode;
  }

  public HttpStatus getHttpStatus() {
    return httpStatus;
  }
}
