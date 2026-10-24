package com.ssasm.exception;

import org.springframework.http.HttpStatus;

/**
 * Signals that a requested resource does not exist.
 */
public class ResourceNotFoundException extends ApplicationException {

  public ResourceNotFoundException(String message) {
    super("RESOURCE_NOT_FOUND", message, HttpStatus.NOT_FOUND);
  }
}
