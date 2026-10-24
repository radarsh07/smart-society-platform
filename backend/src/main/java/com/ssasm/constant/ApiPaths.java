package com.ssasm.constant;

/**
 * Central API path definitions used by security and controllers.
 */
public final class ApiPaths {

  public static final String API_PREFIX = "/api";
  public static final String AUTH_PREFIX = "/api/auth";
  public static final String USERS_PREFIX = "/api/users";
  public static final String LOGIN = "/api/auth/login";
  public static final String ME = "/api/auth/me";
  public static final String CHANGE_PASSWORD = "/api/auth/change-password";
  public static final String LOGOUT = "/api/auth/logout";
  public static final String REGISTER_USER = "/api/users";

  private ApiPaths() {
    throw new UnsupportedOperationException("Utility class");
  }
}