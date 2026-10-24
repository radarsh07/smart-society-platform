package com.ssasm.util;

import java.time.LocalDateTime;
import com.ssasm.response.ApiResponse;
import com.ssasm.response.ErrorResponse;
import com.ssasm.response.ValidationErrorResponse;

/**
 * Standard response factory helpers.
 */
public final class ResponseUtil {

  private ResponseUtil() {
    throw new UnsupportedOperationException("Utility class");
  }

  public static <T> ApiResponse<T> success(String message, T data) {
    return ApiResponse.<T>builder()
        .success(true)
        .message(message)
        .data(data)
        .build();
  }

  public static ErrorResponse error(String errorCode, String message, String path) {
    return ErrorResponse.builder()
        .errorCode(errorCode)
        .message(message)
        .path(path)
        .timestamp(LocalDateTime.now())
        .build();
  }

  public static ValidationErrorResponse validationError(String message, String path) {
    return ValidationErrorResponse.builder()
        .message(message)
        .path(path)
        .timestamp(LocalDateTime.now())
        .fieldErrors(java.util.List.of())
        .build();
  }
}
