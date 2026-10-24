package com.ssasm.mapper.auth;

import org.springframework.stereotype.Component;
import com.ssasm.entity.auth.User;
import com.ssasm.response.auth.UserSummaryResponse;

/**
 * Manual mapper for authentication user projections.
 */
@Component
public class AuthUserMapper {

  public UserSummaryResponse toSummaryResponse(User user) {
    return UserSummaryResponse.builder()
        .id(user.getId())
        .username(user.getUsername())
        .fullName(user.getFullName())
        .email(user.getEmail())
        .phoneNumber(user.getPhoneNumber())
        .role(user.getRole().getName())
        .build();
  }
}
