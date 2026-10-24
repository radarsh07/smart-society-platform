import { httpClient } from './httpClient';
import type { ApiResponse, PageResponse } from '@/types/api';
import type {
  ServiceProviderRequest,
  ServiceProviderResponse,
  TrustedVisitorRequest,
  TrustedVisitorResponse,
  VisitorApprovalRequest,
  VisitorInvitationRequest,
  VisitorInvitationResponse,
  GateTokenVerificationResult,
  QuickVisitorPassRequest,
} from '@/types/visitor';

export const visitorApi = {
  createInvitation: async (payload: VisitorInvitationRequest) => {
    const response = await httpClient.post<ApiResponse<VisitorInvitationResponse>>('/visitors/invitations', payload);
    return response.data.data;
  },
  approveInvitation: async (invitationId: number, payload: VisitorApprovalRequest) => {
    const response = await httpClient.put<ApiResponse<VisitorInvitationResponse>>(`/visitors/invitations/${invitationId}`, payload);
    return response.data.data;
  },
  recordExit: async (invitationId: number) => {
    const response = await httpClient.post<ApiResponse<VisitorInvitationResponse>>(`/visitors/invitations/${invitationId}/exit`);
    return response.data.data;
  },
  verifyInvitation: async (qrCodeToken: string) => {
    const response = await httpClient.post<ApiResponse<VisitorInvitationResponse>>(`/visitors/verify?qrCodeToken=${encodeURIComponent(qrCodeToken)}`);
    return response.data.data;
  },
  scanGateToken: async (token: string) => {
    const response = await httpClient.post<ApiResponse<GateTokenVerificationResult>>(`/visitors/gate-scan?token=${encodeURIComponent(token)}`);
    return response.data.data;
  },
  createQuickPass: async (payload: QuickVisitorPassRequest) => {
    const response = await httpClient.post<ApiResponse<VisitorInvitationResponse>>('/visitors/quick-pass', payload);
    return response.data.data;
  },
  logResidentMovement: async (residentId: number, direction: 'ENTRY' | 'EXIT') => {
    const response = await httpClient.post<ApiResponse<GateTokenVerificationResult>>(`/visitors/log-resident-movement?residentId=${residentId}&direction=${direction}`);
    return response.data.data;
  },
  deleteInvitation: async (invitationId: number) => {
    const response = await httpClient.delete<ApiResponse<string>>(`/visitors/invitations/${invitationId}`);
    return response.data.data;
  },
  listInvitations: async (page = 0, size = 10, sortBy = 'createdAt', sortDirection: 'ASC' | 'DESC' = 'DESC') => {
    const response = await httpClient.get<ApiResponse<PageResponse<VisitorInvitationResponse>>>('/visitors/invitations', {
      params: { page, size, sortBy, sortDirection },
    });
    return response.data.data;
  },
  createTrustedVisitor: async (payload: TrustedVisitorRequest) => {
    const response = await httpClient.post<ApiResponse<TrustedVisitorResponse>>('/visitors/trusted', payload);
    return response.data.data;
  },
  deleteTrustedVisitor: async (trustedVisitorId: number) => {
    const response = await httpClient.delete<ApiResponse<string>>(`/visitors/trusted/${trustedVisitorId}`);
    return response.data.data;
  },
  listTrustedVisitors: async (page = 0, size = 10, sortBy = 'createdAt', sortDirection: 'ASC' | 'DESC' = 'DESC') => {
    const response = await httpClient.get<ApiResponse<PageResponse<TrustedVisitorResponse>>>('/visitors/trusted', {
      params: { page, size, sortBy, sortDirection },
    });
    return response.data.data;
  },
  createServiceProvider: async (payload: ServiceProviderRequest) => {
    const response = await httpClient.post<ApiResponse<ServiceProviderResponse>>('/visitors/providers', payload);
    return response.data.data;
  },
  deleteServiceProvider: async (serviceProviderId: number) => {
    const response = await httpClient.delete<ApiResponse<string>>(`/visitors/providers/${serviceProviderId}`);
    return response.data.data;
  },
  listServiceProviders: async (page = 0, size = 10, sortBy = 'createdAt', sortDirection: 'ASC' | 'DESC' = 'DESC') => {
    const response = await httpClient.get<ApiResponse<PageResponse<ServiceProviderResponse>>>('/visitors/providers', {
      params: { page, size, sortBy, sortDirection },
    });
    return response.data.data;
  },
};
