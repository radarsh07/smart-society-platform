package com.ssasm.security;

import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.ssasm.constant.SecurityConstants;
import com.ssasm.entity.auth.User;
import com.ssasm.enums.AccountStatus;

/**
 * Security principal backed by the application user entity.
 */
public class UserPrincipal implements UserDetails {

  private final Long id;
  private final String username;
  private final String password;
  private final String fullName;
  private final String email;
  private final String phoneNumber;
  private final String roleName;
  private final boolean enabled;

  private UserPrincipal(
      Long id,
      String username,
      String password,
      String fullName,
      String email,
      String phoneNumber,
      String roleName,
      boolean enabled) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.roleName = roleName;
    this.enabled = enabled;
  }

  public static UserPrincipal fromUser(User user) {
    return new UserPrincipal(
        user.getId(),
        user.getUsername(),
        user.getPasswordHash(),
        user.getFullName(),
        user.getEmail(),
        user.getPhoneNumber(),
        user.getRole().getName().name(),
      user.getAccountStatus() == AccountStatus.ACTIVE);
  }

  public Long getId() {
    return id;
  }

  public String getFullName() {
    return fullName;
  }

  public String getEmail() {
    return email;
  }

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public String getRoleName() {
    return roleName;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority(SecurityConstants.ROLE_PREFIX + roleName));
  }

  @Override
  public String getPassword() {
    return password;
  }

  @Override
  public String getUsername() {
    return username;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return enabled;
  }
}
