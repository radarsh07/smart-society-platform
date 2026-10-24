package com.ssasm.response.auth;

import com.ssasm.enums.RoleName;
import lombok.Builder;
import lombok.Getter;

/**
 * Compact user projection for secure responses.
 */
@Getter
@Builder
public class UserSummaryResponse {

  private Long id;
  private String username;
  private String fullName;
  private String email;
  private String phoneNumber;
  private RoleName role;
}