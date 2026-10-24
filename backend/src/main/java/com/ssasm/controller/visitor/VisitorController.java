package com.ssasm.controller.visitor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.dto.visitor.ServiceProviderRequest;
import com.ssasm.dto.visitor.TrustedVisitorRequest;
import com.ssasm.dto.visitor.VisitorApprovalRequest;
import com.ssasm.dto.visitor.VisitorInvitationRequest;
import com.ssasm.response.ApiResponse;
import com.ssasm.response.PageResponse;
import com.ssasm.response.visitor.ServiceProviderResponse;
import com.ssasm.response.visitor.TrustedVisitorResponse;
import com.ssasm.response.visitor.VisitorInvitationResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.security.annotation.SocietyAdminOnly;
import com.ssasm.security.annotation.SocietyAdminOrSecurityGuardOnly;
import com.ssasm.service.visitor.VisitorService;
import com.ssasm.util.ResponseUtil;

@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

  private final VisitorService visitorService;

  public VisitorController(VisitorService visitorService) {
    this.visitorService = visitorService;
  }

  @PostMapping("/invitations")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<VisitorInvitationResponse>> createInvitation(
      @Valid @RequestBody VisitorInvitationRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    VisitorInvitationResponse response = visitorService.createInvitation(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Visitor invitation created successfully", response));
  }

  @PutMapping("/invitations/{invitationId}")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<VisitorInvitationResponse>> approveInvitation(
      @PathVariable Long invitationId,
      @Valid @RequestBody VisitorApprovalRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    VisitorInvitationResponse response = visitorService.approveInvitation(invitationId, request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Visitor invitation updated successfully", response));
  }

  @PostMapping("/invitations/{invitationId}/exit")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_SECURITY_GUARD', 'ROLE_RESIDENT')")
  public ResponseEntity<ApiResponse<VisitorInvitationResponse>> recordExit(
      @PathVariable Long invitationId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    VisitorInvitationResponse response = visitorService.recordExit(invitationId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Visitor exit recorded successfully", response));
  }

  @PostMapping("/verify")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_SECURITY_GUARD', 'ROLE_RESIDENT')")
  public ResponseEntity<ApiResponse<VisitorInvitationResponse>> verifyInvitation(
      @RequestParam String qrCodeToken,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    VisitorInvitationResponse response = visitorService.verifyInvitation(qrCodeToken, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Visitor entry verified successfully", response));
  }

  @DeleteMapping("/invitations/{invitationId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<String>> deleteInvitation(
      @PathVariable Long invitationId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    visitorService.deleteInvitation(invitationId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Visitor invitation deleted successfully", "Deleted"));
  }

  @GetMapping("/invitations")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<VisitorInvitationResponse>>> listInvitations(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Visitor invitations fetched successfully", visitorService.listInvitations(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/trusted")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<TrustedVisitorResponse>> createTrustedVisitor(
      @Valid @RequestBody TrustedVisitorRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    TrustedVisitorResponse response = visitorService.createTrustedVisitor(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Trusted visitor created successfully", response));
  }

  @DeleteMapping("/trusted/{trustedVisitorId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<String>> deleteTrustedVisitor(
      @PathVariable Long trustedVisitorId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    visitorService.deleteTrustedVisitor(trustedVisitorId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Trusted visitor deleted successfully", "Deleted"));
  }

  @GetMapping("/trusted")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<TrustedVisitorResponse>>> listTrustedVisitors(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Trusted visitors fetched successfully", visitorService.listTrustedVisitors(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/providers")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<ServiceProviderResponse>> createServiceProvider(
      @Valid @RequestBody ServiceProviderRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ServiceProviderResponse response = visitorService.createServiceProvider(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Service provider created successfully", response));
  }

  @DeleteMapping("/providers/{serviceProviderId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<String>> deleteServiceProvider(
      @PathVariable Long serviceProviderId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    visitorService.deleteServiceProvider(serviceProviderId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Service provider deleted successfully", "Deleted"));
  }

  @GetMapping("/providers")
  @SocietyAdminOrSecurityGuardOnly
  public ResponseEntity<ApiResponse<PageResponse<ServiceProviderResponse>>> listServiceProviders(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Service providers fetched successfully", visitorService.listServiceProviders(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/gate-scan")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_SECURITY_GUARD', 'ROLE_RESIDENT')")
  public ResponseEntity<ApiResponse<com.ssasm.response.visitor.GateScanResult>> gateScan(
      @RequestParam String token,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    com.ssasm.response.visitor.GateScanResult result = visitorService.scanGateToken(token, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Gate scan evaluated", result));
  }

  @PostMapping("/quick-pass")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_SECURITY_GUARD', 'ROLE_RESIDENT')")
  public ResponseEntity<ApiResponse<VisitorInvitationResponse>> createQuickPass(
      @Valid @RequestBody com.ssasm.dto.visitor.QuickGatePassRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    VisitorInvitationResponse response = visitorService.createQuickPass(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Gate visitor pass issued successfully", response));
  }

  @PostMapping("/log-resident-movement")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_SECURITY_GUARD', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF')")
  public ResponseEntity<ApiResponse<com.ssasm.response.visitor.GateScanResult>> logResidentMovement(
      @RequestParam Long residentId,
      @RequestParam String direction,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    com.ssasm.response.visitor.GateScanResult result = visitorService.logResidentMovement(residentId, direction, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Resident gate movement logged", result));
  }
}
