package com.ssasm.service.auth;

import com.ssasm.request.auth.ChangePasswordRequest;
import com.ssasm.request.auth.CreateUserRequest;
import com.ssasm.request.auth.LoginRequest;
import com.ssasm.response.auth.LoginResponse;
import com.ssasm.response.auth.PasswordChangeResponse;
import com.ssasm.response.auth.UserSummaryResponse;
import com.ssasm.security.UserPrincipal;

/**
 * Authentication use cases for login and secured user lifecycle operations.
 */
public interface AuthService {

  LoginResponse login(LoginRequest request, String ipAddress);

  UserSummaryResponse createUser(CreateUserRequest request, String performedBy, String ipAddress);

  UserSummaryResponse me(UserPrincipal principal);

  PasswordChangeResponse changePassword(ChangePasswordRequest request, UserPrincipal principal, String ipAddress);

  void logout(UserPrincipal principal, String token, String ipAddress);
}
