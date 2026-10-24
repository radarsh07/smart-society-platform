package com.ssasm.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.audit.AuthenticationAuditEvent;
import com.ssasm.audit.AuthenticationAuditService;
import com.ssasm.entity.auth.Role;
import com.ssasm.entity.auth.User;
import com.ssasm.enums.AccountStatus;
import com.ssasm.enums.RoleName;
import com.ssasm.exception.BadRequestException;
import com.ssasm.exception.ResourceNotFoundException;
import com.ssasm.exception.UnauthorizedException;
import com.ssasm.mapper.auth.AuthUserMapper;
import com.ssasm.repository.auth.RoleRepository;
import com.ssasm.repository.auth.UserRepository;
import com.ssasm.request.auth.ChangePasswordRequest;
import com.ssasm.request.auth.CreateUserRequest;
import com.ssasm.request.auth.LoginRequest;
import com.ssasm.response.auth.LoginResponse;
import com.ssasm.response.auth.PasswordChangeResponse;
import com.ssasm.response.auth.UserSummaryResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.security.jwt.JwtTokenGenerator;
import com.ssasm.security.jwt.JwtTokenGenerator.GeneratedToken;
import com.ssasm.security.jwt.JwtRevocationService;
import com.ssasm.security.jwt.JwtUtil;
import com.ssasm.service.auth.AuthService;
import com.ssasm.util.DateUtil;

/**
 * Implements authentication, registration, password change, and logout flows.
 */
@Service
@Transactional
public class AuthServiceImpl implements AuthService {

  private final AuthenticationManager authenticationManager;
  private final PasswordEncoder passwordEncoder;
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final AuthUserMapper authUserMapper;
  private final JwtTokenGenerator jwtTokenGenerator;
  private final JwtUtil jwtUtil;
  private final JwtRevocationService jwtRevocationService;
  private final AuthenticationAuditService authenticationAuditService;

  public AuthServiceImpl(
      AuthenticationManager authenticationManager,
      PasswordEncoder passwordEncoder,
      UserRepository userRepository,
      RoleRepository roleRepository,
      AuthUserMapper authUserMapper,
      JwtTokenGenerator jwtTokenGenerator,
      JwtUtil jwtUtil,
      JwtRevocationService jwtRevocationService,
      AuthenticationAuditService authenticationAuditService) {
    this.authenticationManager = authenticationManager;
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.authUserMapper = authUserMapper;
    this.jwtTokenGenerator = jwtTokenGenerator;
    this.jwtUtil = jwtUtil;
    this.jwtRevocationService = jwtRevocationService;
    this.authenticationAuditService = authenticationAuditService;
  }

  @Override
  public LoginResponse login(LoginRequest request, String ipAddress) {
    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
      UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
      User user = userRepository.findByUsernameIgnoreCase(principal.getUsername())
          .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

      if (user.getAccountStatus() == AccountStatus.PENDING) {
        throw new UnauthorizedException("Your resident account is pending administrator approval. Please wait for the society admin to verify and approve your registration.");
      }
      if (user.getAccountStatus() == AccountStatus.DISABLED || user.getAccountStatus() == AccountStatus.LOCKED) {
        throw new UnauthorizedException("Your account is " + user.getAccountStatus() + ". Please contact the society administrator.");
      }

      GeneratedToken token = jwtTokenGenerator.generateAccessToken(user);
      user.setLastLoginAt(DateUtil.nowUtc());
      userRepository.save(user);

      authenticationAuditService.log(AuthenticationAuditEvent.builder()
          .timestamp(DateUtil.nowUtc())
          .username(user.getUsername())
          .ipAddress(ipAddress)
          .action("LOGIN")
          .result("SUCCESS")
          .detail("Successful authentication")
          .build());

      return LoginResponse.builder()
          .accessToken(token.getToken())
          .tokenType("Bearer")
          .expiresAt(token.getExpiresAt().atOffset(java.time.ZoneOffset.UTC).toLocalDateTime())
          .role(user.getRole().getName())
          .user(authUserMapper.toSummaryResponse(user))
          .build();
    } catch (AuthenticationException exception) {
      userRepository.findByUsernameIgnoreCase(request.getUsername().trim())
          .or(() -> userRepository.findByEmailIgnoreCase(request.getUsername().trim()))
          .ifPresent(existingUser -> {
            if (existingUser.getAccountStatus() == AccountStatus.PENDING) {
              throw new UnauthorizedException("Your resident account is pending administrator approval. Please wait for the society admin to verify and approve your registration.");
            }
            if (existingUser.getAccountStatus() == AccountStatus.DISABLED || existingUser.getAccountStatus() == AccountStatus.LOCKED) {
              throw new UnauthorizedException("Your account is " + existingUser.getAccountStatus() + ". Please contact the society administrator.");
            }
          });

      authenticationAuditService.log(AuthenticationAuditEvent.builder()
          .timestamp(DateUtil.nowUtc())
          .username(request.getUsername())
          .ipAddress(ipAddress)
          .action("LOGIN")
          .result("FAILED")
          .detail("Invalid credentials or inactive account")
          .build());
      throw new UnauthorizedException("Invalid username or password");
    }
  }

  @Override
  public UserSummaryResponse createUser(CreateUserRequest request, String performedBy, String ipAddress) {
    if (request.getRole() == RoleName.SOCIETY_ADMIN) {
      throw new BadRequestException("Society Admin accounts cannot be created through the user creation API");
    }

    if (userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
      throw new BadRequestException("Username already exists");
    }
    if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
      throw new BadRequestException("Email already exists");
    }
    if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
      throw new BadRequestException("Phone number already exists");
    }

    Role role = roleRepository.findByName(request.getRole())
        .orElseThrow(() -> new ResourceNotFoundException("Requested role is not available"));

    User user = new User();
    user.setUsername(request.getUsername().trim());
    user.setFullName(request.getFullName().trim());
    user.setEmail(request.getEmail().trim().toLowerCase());
    user.setPhoneNumber(request.getPhoneNumber().trim());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setRole(role);
    user.setAccountStatus(AccountStatus.ACTIVE);
    user.setCreatedBy(performedBy);
    user.setUpdatedBy(performedBy);

    User savedUser = userRepository.save(user);

    authenticationAuditService.log(AuthenticationAuditEvent.builder()
        .timestamp(DateUtil.nowUtc())
        .username(performedBy)
        .ipAddress(ipAddress)
        .action("USER_CREATION")
        .result("SUCCESS")
        .detail("Created user " + savedUser.getUsername() + " with role " + savedUser.getRole().getName())
        .build());

    return authUserMapper.toSummaryResponse(savedUser);
  }

  @Override
  public UserSummaryResponse me(UserPrincipal principal) {
    User user = userRepository.findByUsernameIgnoreCase(principal.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    return authUserMapper.toSummaryResponse(user);
  }

  @Override
  public PasswordChangeResponse changePassword(ChangePasswordRequest request, UserPrincipal principal, String ipAddress) {
    User user = userRepository.findByUsernameIgnoreCase(principal.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
      authenticationAuditService.log(AuthenticationAuditEvent.builder()
          .timestamp(DateUtil.nowUtc())
          .username(user.getUsername())
          .ipAddress(ipAddress)
          .action("PASSWORD_CHANGE")
          .result("FAILED")
          .detail("Current password mismatch")
          .build());
      throw new UnauthorizedException("Current password is incorrect");
    }

    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    user.setUpdatedBy(principal.getUsername());
    userRepository.save(user);

    authenticationAuditService.log(AuthenticationAuditEvent.builder()
        .timestamp(DateUtil.nowUtc())
        .username(user.getUsername())
        .ipAddress(ipAddress)
        .action("PASSWORD_CHANGE")
        .result("SUCCESS")
        .detail("Password changed successfully")
        .build());

    return PasswordChangeResponse.builder().message("Password changed successfully").build();
  }

  @Override
  public void logout(UserPrincipal principal, String token, String ipAddress) {
    if (token != null && !token.isBlank()) {
      long expiresAt = jwtUtil.extractExpiration(token).getTime();
      jwtRevocationService.revoke(token, expiresAt);
    }

    authenticationAuditService.log(AuthenticationAuditEvent.builder()
        .timestamp(DateUtil.nowUtc())
        .username(principal.getUsername())
        .ipAddress(ipAddress)
        .action("LOGOUT")
        .result("SUCCESS")
        .detail("Access token revoked client-side and on server blacklist")
        .build());
  }
}
