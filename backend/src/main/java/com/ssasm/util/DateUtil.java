package com.ssasm.util;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import com.ssasm.constant.ApplicationConstants;

/**
 * Date helper methods for consistent UTC-based formatting.
 */
public final class DateUtil {

  private static final DateTimeFormatter DATE_FORMATTER =
      DateTimeFormatter.ofPattern(ApplicationConstants.DEFAULT_DATE_PATTERN);
  private static final DateTimeFormatter DATE_TIME_FORMATTER =
      DateTimeFormatter.ofPattern(ApplicationConstants.DEFAULT_DATE_TIME_PATTERN);

  private DateUtil() {
    throw new UnsupportedOperationException("Utility class");
  }

  public static LocalDateTime nowUtc() {
    return LocalDateTime.now(ZoneOffset.UTC);
  }

  public static String formatDate(LocalDateTime dateTime) {
    return dateTime == null ? null : dateTime.format(DATE_FORMATTER);
  }

  public static String formatDateTime(LocalDateTime dateTime) {
    return dateTime == null ? null : dateTime.format(DATE_TIME_FORMATTER);
  }
}
