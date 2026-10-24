package com.ssasm.controller.society;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.constant.ApiPaths;
import com.ssasm.dto.society.SocietyRequest;
import com.ssasm.response.ApiResponse;
import com.ssasm.response.society.SocietyResponse;
import com.ssasm.security.annotation.SocietyAdminOnly;
import com.ssasm.security.UserPrincipal;
import com.ssasm.service.society.SocietyService;
import com.ssasm.util.ResponseUtil;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * REST endpoints for society master management.
 */
@RestController
@RequestMapping("/api/societies")
public class SocietyController {

  private final SocietyService societyService;

  public SocietyController(SocietyService societyService) {
    this.societyService = societyService;
  }

  @PostMapping
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<SocietyResponse>> create(
      @Valid @RequestBody SocietyRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    SocietyResponse response = societyService.createSociety(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Society created successfully", response));
  }

  @PutMapping("/{societyId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<SocietyResponse>> update(
      @PathVariable Long societyId,
      @Valid @RequestBody SocietyRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    SocietyResponse response = societyService.updateSociety(societyId, request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Society updated successfully", response));
  }

  @GetMapping("/{societyId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<SocietyResponse>> get(@PathVariable Long societyId) {
    return ResponseEntity.ok(ResponseUtil.success("Society fetched successfully", societyService.getSociety(societyId)));
  }

  @GetMapping("/current")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<SocietyResponse>> current() {
    return ResponseEntity.ok(ResponseUtil.success("Society fetched successfully", societyService.getCurrentSociety()));
  }
}
