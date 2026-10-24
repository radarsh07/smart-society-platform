package com.ssasm.security.jwt;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * In-memory revocation list for JWT logout support.
 */
@Service
public class InMemoryJwtRevocationService implements JwtRevocationService {

  private final Map<String, Long> revokedTokens = new ConcurrentHashMap<>();

  @Override
  public void revoke(String token, long expiresAtEpochMillis) {
    revokedTokens.put(token, expiresAtEpochMillis);
  }

  @Override
  public boolean isRevoked(String token) {
    Long expiresAt = revokedTokens.get(token);
    return expiresAt != null && expiresAt > Instant.now().toEpochMilli();
  }

  @Scheduled(fixedDelay = 300000)
  public void purgeExpiredTokens() {
    long now = Instant.now().toEpochMilli();
    revokedTokens.entrySet().removeIf(entry -> entry.getValue() <= now);
  }
}
