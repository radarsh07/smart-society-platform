package com.ssasm.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.constant.ApiPaths;
import com.ssasm.request.auth.CreateUserRequest;
import com.ssasm.response.ApiResponse;
import com.ssasm.response.auth.UserSummaryResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.security.annotation.SocietyAdminOnly;
import com.ssasm.service.auth.AuthService;
import com.ssasm.util.ResponseUtil;

/**
 * Admin-only user creation endpoint.
 */
@RestController
@RequestMapping(ApiPaths.USERS_PREFIX)
public class UserController {

  private final AuthService authService;

  public UserController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<UserSummaryResponse>> createUser(
      @Valid @RequestBody CreateUserRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    UserSummaryResponse response = authService.createUser(
        request,
        principal.getUsername(),
        httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("User created successfully", response));
  }
}
