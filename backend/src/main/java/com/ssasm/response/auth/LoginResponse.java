package com.ssasm.response.auth;

import java.time.LocalDateTime;
import com.ssasm.enums.RoleName;
import lombok.Builder;
import lombok.Getter;

/**
 * Login response containing the access token and safe user information.
 */
@Getter
@Builder
public class LoginResponse {

  private String accessToken;
  private String tokenType;
  private LocalDateTime expiresAt;
  private RoleName role;
  private UserSummaryResponse user;
}