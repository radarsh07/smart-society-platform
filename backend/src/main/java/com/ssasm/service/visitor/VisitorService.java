package com.ssasm.service.visitor;

import com.ssasm.dto.visitor.ServiceProviderRequest;
import com.ssasm.dto.visitor.TrustedVisitorRequest;
import com.ssasm.dto.visitor.VisitorApprovalRequest;
import com.ssasm.dto.visitor.VisitorInvitationRequest;
import com.ssasm.response.PageResponse;
import com.ssasm.response.visitor.ServiceProviderResponse;
import com.ssasm.response.visitor.TrustedVisitorResponse;
import com.ssasm.response.visitor.VisitorInvitationResponse;

public interface VisitorService {

  VisitorInvitationResponse createInvitation(VisitorInvitationRequest request, String username, String ipAddress);

  VisitorInvitationResponse approveInvitation(Long invitationId, VisitorApprovalRequest request, String username, String ipAddress);

  VisitorInvitationResponse verifyInvitation(String qrCodeToken, String username, String ipAddress);

  void deleteInvitation(Long invitationId, String username, String ipAddress);

  VisitorInvitationResponse recordExit(Long invitationId, String username, String ipAddress);

  PageResponse<VisitorInvitationResponse> listInvitations(int page, int size, String sortBy, String sortDirection);

  TrustedVisitorResponse createTrustedVisitor(TrustedVisitorRequest request, String username, String ipAddress);

  void deleteTrustedVisitor(Long trustedVisitorId, String username, String ipAddress);

  PageResponse<TrustedVisitorResponse> listTrustedVisitors(int page, int size, String sortBy, String sortDirection);

  ServiceProviderResponse createServiceProvider(ServiceProviderRequest request, String username, String ipAddress);

  void deleteServiceProvider(Long serviceProviderId, String username, String ipAddress);

  PageResponse<ServiceProviderResponse> listServiceProviders(int page, int size, String sortBy, String sortDirection);

  com.ssasm.response.visitor.GateScanResult scanGateToken(String token, String username, String ipAddress);

  VisitorInvitationResponse createQuickPass(com.ssasm.dto.visitor.QuickGatePassRequest request, String username, String ipAddress);

  com.ssasm.response.visitor.GateScanResult logResidentMovement(Long residentId, String direction, String username, String ipAddress);
}
