package com.ssasm.security.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds JWT configuration from application properties.
 */
@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
    String secret,
    long accessTokenValidityMs,
    String issuer) {
}
