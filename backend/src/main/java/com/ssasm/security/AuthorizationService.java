package com.ssasm.security;

import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * Reusable authorization helper for future module-level rules.
 */
@Component("authorizationService")
public class AuthorizationService {

  public boolean hasRole(Collection<? extends GrantedAuthority> authorities, String requiredRole) {
    return authorities != null && authorities.stream().anyMatch(authority -> authority.getAuthority().equals(requiredRole));
  }
}
