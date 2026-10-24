package com.ssasm.security.jwt;

/**
 * Supports JWT logout by tracking revoked access tokens until expiration.
 */
public interface JwtRevocationService {

  void revoke(String token, long expiresAtEpochMillis);

  boolean isRevoked(String token);
}
