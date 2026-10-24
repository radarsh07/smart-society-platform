package com.ssasm.controller.society;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.dto.society.FlatRequest;
import com.ssasm.dto.society.FlatSearchRequest;
import com.ssasm.response.ApiResponse;
import com.ssasm.response.PageResponse;
import com.ssasm.response.society.FlatResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.security.annotation.SocietyAdminOnly;
import com.ssasm.service.society.FlatService;
import com.ssasm.util.ResponseUtil;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * REST endpoints for flat management.
 */
@RestController
@RequestMapping("/api/flats")
public class FlatController {

  private final FlatService flatService;

  public FlatController(FlatService flatService) {
    this.flatService = flatService;
  }

  @PostMapping
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<FlatResponse>> create(
      @Valid @RequestBody FlatRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    FlatResponse response = flatService.createFlat(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Flat created successfully", response));
  }

  @PutMapping("/{flatId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<FlatResponse>> update(
      @PathVariable Long flatId,
      @Valid @RequestBody FlatRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    FlatResponse response = flatService.updateFlat(flatId, request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Flat updated successfully", response));
  }

  @DeleteMapping("/{flatId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<String>> delete(
      @PathVariable Long flatId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    flatService.deleteFlat(flatId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Flat deleted successfully", "Deleted"));
  }

  @GetMapping("/{flatId}")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<FlatResponse>> get(@PathVariable Long flatId) {
    return ResponseEntity.ok(ResponseUtil.success("Flat fetched successfully", flatService.getFlat(flatId)));
  }

  @GetMapping
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<FlatResponse>>> list(@ModelAttribute FlatSearchRequest request) {
    return ResponseEntity.ok(ResponseUtil.success("Flats fetched successfully", flatService.listFlats(request)));
  }
}
