package com.ssasm.util;

import java.util.Locale;

/**
 * String helper methods for trimming and normalization.
 */
public final class StringUtil {

  private StringUtil() {
    throw new UnsupportedOperationException("Utility class");
  }

  public static boolean hasText(String value) {
    return value != null && !value.trim().isEmpty();
  }

  public static String safeTrim(String value) {
    return value == null ? null : value.trim();
  }

  public static String normalize(String value) {
    return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
  }
}
