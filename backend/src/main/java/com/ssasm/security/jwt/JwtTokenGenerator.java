package com.ssasm.security.jwt;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;
import com.ssasm.constant.SecurityConstants;
import com.ssasm.entity.auth.User;

/**
 * Generates access tokens for authenticated users.
 */
@Component
public class JwtTokenGenerator {

  private final JwtProperties jwtProperties;
  private final JwtUtil jwtUtil;

  public JwtTokenGenerator(JwtProperties jwtProperties, JwtUtil jwtUtil) {
    this.jwtProperties = jwtProperties;
    this.jwtUtil = jwtUtil;
  }

  public GeneratedToken generateAccessToken(User user) {
    long expiresAt = Instant.now().toEpochMilli() + jwtProperties.accessTokenValidityMs();
    Map<String, Object> claims = new HashMap<>();
    claims.put(SecurityConstants.CLAIM_ROLE, user.getRole().getName().name());
    claims.put(SecurityConstants.CLAIM_FULL_NAME, user.getFullName());
    claims.put(SecurityConstants.CLAIM_EMAIL, user.getEmail());
    claims.put(SecurityConstants.CLAIM_PHONE_NUMBER, user.getPhoneNumber());

    String token = jwtUtil.createAccessToken(user.getUsername(), claims, expiresAt);
    return new GeneratedToken(token, Instant.ofEpochMilli(expiresAt));
  }

  public static final class GeneratedToken {

    private final String token;
    private final Instant expiresAt;

    public GeneratedToken(String token, Instant expiresAt) {
      this.token = token;
      this.expiresAt = expiresAt;
    }

    public String getToken() {
      return token;
    }

    public Instant getExpiresAt() {
      return expiresAt;
    }
  }
}
