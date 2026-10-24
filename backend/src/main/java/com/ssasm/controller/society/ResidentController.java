package com.ssasm.controller.society;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.dto.society.ResidentRequest;
import com.ssasm.dto.society.ResidentSearchRequest;
import com.ssasm.response.ApiResponse;
import com.ssasm.response.PageResponse;
import com.ssasm.response.society.ResidentResponse;
import com.ssasm.response.society.ResidentSummaryResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.security.annotation.ResidentOnly;
import com.ssasm.security.annotation.SocietyAdminOrSecurityGuardOnly;
import com.ssasm.security.annotation.SocietyAdminOnly;
import com.ssasm.service.society.ResidentService;
import com.ssasm.util.ResponseUtil;

/**
 * REST endpoints for resident management.
 */
@RestController
@RequestMapping("/api/residents")
public class ResidentController {

  private final ResidentService residentService;

  public ResidentController(ResidentService residentService) {
    this.residentService = residentService;
  }

  @PostMapping
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<ResidentResponse>> create(
      @Valid @RequestBody ResidentRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ResidentResponse response = residentService.createResident(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Resident created successfully", response));
  }

  @PutMapping("/{residentId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<ResidentResponse>> update(
      @PathVariable Long residentId,
      @Valid @RequestBody ResidentRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ResidentResponse response = residentService.updateResident(residentId, request, principal.getUsername(), principal.getRoleName(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Resident updated successfully", response));
  }

  @DeleteMapping("/{residentId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<String>> delete(
      @PathVariable Long residentId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    residentService.deleteResident(residentId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Resident deleted successfully", "Deleted"));
  }

  @GetMapping("/pending-approvals")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<java.util.List<ResidentSummaryResponse>>> getPendingApprovals() {
    return ResponseEntity.ok(ResponseUtil.success("Pending resident approvals fetched successfully", residentService.getPendingApprovals()));
  }

  @PutMapping("/{residentId}/approve")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<ResidentResponse>> approveResident(
      @PathVariable Long residentId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ResidentResponse response = residentService.approveResident(residentId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Resident approved successfully. Access granted.", response));
  }

  @PutMapping("/{residentId}/reject")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<ResidentResponse>> rejectResident(
      @PathVariable Long residentId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ResidentResponse response = residentService.rejectResident(residentId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Resident registration rejected.", response));
  }

  @GetMapping("/{residentId}")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<ResidentResponse>> get(@PathVariable Long residentId) {
    return ResponseEntity.ok(ResponseUtil.success("Resident fetched successfully", residentService.getResident(residentId)));
  }

  @GetMapping("/basic/{residentId}")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<ResidentSummaryResponse>> getBasic(@PathVariable Long residentId) {
    return ResponseEntity.ok(ResponseUtil.success("Resident fetched successfully", residentService.getResidentBasic(residentId)));
  }

  @GetMapping
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<ResidentSummaryResponse>>> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Residents fetched successfully", residentService.listResidents(page, size, sortBy, sortDirection)));
  }

  @GetMapping("/search")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<ResidentSummaryResponse>>> search(@ModelAttribute ResidentSearchRequest request) {
    return ResponseEntity.ok(ResponseUtil.success("Residents fetched successfully", residentService.searchResidents(request)));
  }

  @GetMapping("/me")
  @ResidentOnly
  public ResponseEntity<ApiResponse<ResidentResponse>> me(@AuthenticationPrincipal UserPrincipal principal) {
    return ResponseEntity.ok(ResponseUtil.success("Resident profile fetched successfully", residentService.getMyProfile(principal)));
  }

  @PutMapping("/me")
  @ResidentOnly
  public ResponseEntity<ApiResponse<ResidentResponse>> updateMe(
      @Valid @RequestBody ResidentRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ResidentResponse response = residentService.updateMyProfile(request, principal, httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Resident profile updated successfully", response));
  }
}
