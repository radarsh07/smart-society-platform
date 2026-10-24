package com.ssasm.security.jwt;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKey;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import com.ssasm.constant.SecurityConstants;

/**
 * Low-level JWT helper for claim parsing and token creation.
 */
@Component
public class JwtUtil {

  private final JwtProperties jwtProperties;

  public JwtUtil(JwtProperties jwtProperties) {
    this.jwtProperties = jwtProperties;
  }

  public String createAccessToken(String subject, Map<String, Object> claims, long expiresAtMillis) {
    return Jwts.builder()
        .id(UUID.randomUUID().toString())
        .subject(subject)
        .claims(claims)
        .issuer(jwtProperties.issuer())
        .issuedAt(new Date())
        .expiration(new Date(expiresAtMillis))
        .signWith(getSigningKey())
        .compact();
  }

  public Claims extractClaims(String token) {
    return Jwts.parser()
        .verifyWith((SecretKey) getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public String extractSubject(String token) {
    return extractClaims(token).getSubject();
  }

  public String extractJti(String token) {
    return extractClaims(token).getId();
  }

  public Date extractExpiration(String token) {
    return extractClaims(token).getExpiration();
  }

  public boolean isExpired(String token) {
    Date expiration = extractExpiration(token);
    return expiration.before(new Date());
  }

  public String normalizeBearerToken(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith(SecurityConstants.BEARER_PREFIX)) {
      return null;
    }
    return authorizationHeader.substring(SecurityConstants.BEARER_PREFIX.length());
  }

  private Key getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.secret());
    return Keys.hmacShaKeyFor(keyBytes);
  }
}
