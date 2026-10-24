package com.ssasm.constant;

/**
 * Shared security constants for JWT, roles, and authorization.
 */
public final class SecurityConstants {

  public static final String ROLE_PREFIX = "ROLE_";
  public static final String AUTHORIZATION_HEADER = "Authorization";
  public static final String BEARER_PREFIX = "Bearer ";
  public static final String TOKEN_TYPE_BEARER = "Bearer";
  public static final String CLAIM_ROLE = "role";
  public static final String CLAIM_FULL_NAME = "fullName";
  public static final String CLAIM_EMAIL = "email";
  public static final String CLAIM_PHONE_NUMBER = "phoneNumber";
  public static final String CLAIM_JTI = "jti";

  private SecurityConstants() {
    throw new UnsupportedOperationException("Utility class");
  }
}