package com.ssasm.util;

import java.util.regex.Pattern;

/**
 * Validation helper methods used by shared validation rules.
 */
public final class ValidationUtil {

  private static final Pattern EMAIL_PATTERN =
      Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
  private static final Pattern PHONE_PATTERN = Pattern.compile("^[6-9][0-9]{9}$");
  private static final Pattern FLAT_NUMBER_PATTERN =
      Pattern.compile("^[A-Z]-[0-9]{3,4}$");
  private static final Pattern VEHICLE_NUMBER_PATTERN =
      Pattern.compile("^[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}$");

  private ValidationUtil() {
    throw new UnsupportedOperationException("Utility class");
  }

  public static boolean isValidEmail(String email) {
    return email != null && EMAIL_PATTERN.matcher(email).matches();
  }

  public static boolean isValidPhoneNumber(String phoneNumber) {
    return phoneNumber != null && PHONE_PATTERN.matcher(phoneNumber).matches();
  }

  public static boolean isValidFlatNumber(String flatNumber) {
    return flatNumber != null && FLAT_NUMBER_PATTERN.matcher(flatNumber).matches();
  }

  public static boolean isValidVehicleNumber(String vehicleNumber) {
    return vehicleNumber != null && VEHICLE_NUMBER_PATTERN.matcher(vehicleNumber).matches();
  }
}
