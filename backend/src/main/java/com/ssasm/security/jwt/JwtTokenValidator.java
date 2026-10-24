package com.ssasm.security.jwt;

import java.util.Collection;
import java.util.Collections;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import com.ssasm.constant.SecurityConstants;
import com.ssasm.entity.auth.User;
import com.ssasm.repository.auth.UserRepository;

/**
 * Validates JWT structure, subject, expiration, and blacklist state.
 */
@Component
public class JwtTokenValidator {

  private final JwtUtil jwtUtil;
  private final UserRepository userRepository;
  private final JwtRevocationService jwtRevocationService;

  public JwtTokenValidator(
      JwtUtil jwtUtil,
      UserRepository userRepository,
      JwtRevocationService jwtRevocationService) {
    this.jwtUtil = jwtUtil;
    this.userRepository = userRepository;
    this.jwtRevocationService = jwtRevocationService;
  }

  public boolean isValid(String token) {
    try {
      if (token == null || token.isBlank() || jwtUtil.isExpired(token) || jwtRevocationService.isRevoked(token)) {
        return false;
      }
      String username = jwtUtil.extractSubject(token);
      return userRepository.findByUsernameIgnoreCase(username).isPresent();
    } catch (Exception e) {
      return false;
    }
  }

  public User resolveUser(String token) {
    try {
      return userRepository.findByUsernameIgnoreCase(jwtUtil.extractSubject(token)).orElse(null);
    } catch (Exception e) {
      return null;
    }
  }

  public Collection<SimpleGrantedAuthority> resolveAuthorities(User user) {
    return Collections.singletonList(
        new SimpleGrantedAuthority(SecurityConstants.ROLE_PREFIX + user.getRole().getName().name()));
  }
}
