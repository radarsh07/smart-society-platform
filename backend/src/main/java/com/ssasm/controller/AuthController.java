package com.ssasm.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.constant.ApiPaths;
import com.ssasm.request.auth.ChangePasswordRequest;
import com.ssasm.request.auth.LoginRequest;
import com.ssasm.response.ApiResponse;
import com.ssasm.response.auth.LoginResponse;
import com.ssasm.response.auth.PasswordChangeResponse;
import com.ssasm.response.auth.UserSummaryResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.service.auth.AuthService;
import com.ssasm.util.ResponseUtil;

import org.springframework.web.bind.annotation.RequestParam;
import com.ssasm.dto.society.ResidentSelfRegistrationRequest;
import com.ssasm.repository.society.BuildingRepository;
import com.ssasm.repository.society.FlatRepository;
import com.ssasm.repository.society.SocietyRepository;
import com.ssasm.response.society.ResidentResponse;
import com.ssasm.service.society.ResidentService;

/**
 * Authentication endpoints for login, profile, password change, and logout.
 */
@RestController
@RequestMapping(ApiPaths.AUTH_PREFIX)
public class AuthController {

  private final AuthService authService;
  private final ResidentService residentService;
  private final SocietyRepository societyRepository;
  private final BuildingRepository buildingRepository;
  private final FlatRepository flatRepository;

  public AuthController(
      AuthService authService,
      ResidentService residentService,
      SocietyRepository societyRepository,
      BuildingRepository buildingRepository,
      FlatRepository flatRepository) {
    this.authService = authService;
    this.residentService = residentService;
    this.societyRepository = societyRepository;
    this.buildingRepository = buildingRepository;
    this.flatRepository = flatRepository;
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<LoginResponse>> login(
      @Valid @RequestBody LoginRequest request,
      HttpServletRequest httpServletRequest) {
    LoginResponse response = authService.login(request, httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Login successful", response));
  }

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserSummaryResponse>> me(@AuthenticationPrincipal UserPrincipal principal) {
    return ResponseEntity.ok(ResponseUtil.success("Profile fetched successfully", authService.me(principal)));
  }

  @PutMapping("/change-password")
  public ResponseEntity<ApiResponse<PasswordChangeResponse>> changePassword(
      @Valid @RequestBody ChangePasswordRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    PasswordChangeResponse response = authService.changePassword(request, principal, httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success(response.getMessage(), response));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<String>> logout(
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    String token = httpServletRequest.getHeader("Authorization");
    authService.logout(principal, token == null ? null : token.replace("Bearer ", ""), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Logout successful", "Logged out successfully"));
  }

  @GetMapping("/public-societies")
  public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getPublicSocieties() {
    var societies = societyRepository.findByDeletedFalse().stream().map(s -> {
      java.util.Map<String, Object> map = new java.util.HashMap<>();
      map.put("id", s.getId());
      map.put("societyName", s.getSocietyName());
      map.put("address", s.getAddressLine1() + (s.getCity() != null ? ", " + s.getCity() : ""));
      return map;
    }).toList();
    return ResponseEntity.ok(ResponseUtil.success("Societies fetched", societies));
  }

  @GetMapping("/public-buildings")
  public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getPublicBuildings(@RequestParam Long societyId) {
    var buildings = buildingRepository.findBySocietyIdAndDeletedFalse(societyId).stream().map(b -> {
      java.util.Map<String, Object> map = new java.util.HashMap<>();
      map.put("id", b.getId());
      map.put("buildingName", b.getBuildingName());
      map.put("buildingCode", b.getBuildingCode());
      map.put("totalFloors", b.getTotalFloors());
      return map;
    }).toList();
    return ResponseEntity.ok(ResponseUtil.success("Buildings fetched", buildings));
  }

  @GetMapping("/public-flats")
  public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getPublicFlats(@RequestParam Long buildingId) {
    var flats = flatRepository.findByBuildingIdAndDeletedFalse(buildingId).stream().map(f -> {
      java.util.Map<String, Object> map = new java.util.HashMap<>();
      map.put("id", f.getId());
      map.put("flatNumber", f.getFlatNumber());
      map.put("flatType", f.getFlatType());
      map.put("floorNumber", f.getFloorNumber());
      map.put("status", f.getStatus());
      return map;
    }).toList();
    return ResponseEntity.ok(ResponseUtil.success("Flats fetched", flats));
  }

  @PostMapping("/self-register-resident")
  public ResponseEntity<ApiResponse<ResidentResponse>> selfRegisterResident(
      @Valid @RequestBody ResidentSelfRegistrationRequest request,
      HttpServletRequest httpServletRequest) {
    ResidentResponse response = residentService.selfRegister(request, httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success(
        "Registration application submitted successfully! Your account is pending verification and approval by the Society Administrator.",
        response));
  }
}
