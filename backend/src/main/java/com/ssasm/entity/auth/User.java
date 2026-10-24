package com.ssasm.entity.auth;

import java.time.LocalDateTime;
import com.ssasm.entity.BaseEntity;
import com.ssasm.enums.AccountStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Authentication identity for all login users.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {

  @Column(name = "username", nullable = false, unique = true, length = 100)
  private String username;

  @Column(name = "full_name", nullable = false, length = 150)
  private String fullName;

  @Column(name = "email", nullable = false, unique = true, length = 150)
  private String email;

  @Column(name = "phone_number", nullable = false, unique = true, length = 20)
  private String phoneNumber;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "account_status", nullable = false, length = 30)
  private AccountStatus accountStatus = AccountStatus.ACTIVE;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "role_id", nullable = false)
  private Role role;

  @Column(name = "last_login_at")
  private LocalDateTime lastLoginAt;
}