package com.ssasm.constant;

/**
 * Central application constants shared across the backend foundation.
 */
public final class ApplicationConstants {

  public static final String APPLICATION_NAME = "Secure Smart Apartment & Society Management Platform";
  public static final String DEFAULT_TIME_ZONE = "UTC";
  public static final String DEFAULT_DATE_PATTERN = "yyyy-MM-dd";
  public static final String DEFAULT_DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
  public static final String LOG_FILE_NAME_INFO = "info.log";
  public static final String LOG_FILE_NAME_WARN = "warning.log";
  public static final String LOG_FILE_NAME_ERROR = "error.log";
  public static final String LOG_FILE_NAME_AUDIT = "audit.log";

  private ApplicationConstants() {
    throw new UnsupportedOperationException("Utility class");
  }
}
