export interface VisitorInvitationRequest {
  residentId: number;
  visitorName: string;
  visitorPhone: string;
  visitorCompany?: string;
  purpose?: string;
  expectedArrival?: string;
  expectedDeparture?: string;
}

export interface VisitorApprovalRequest {
  passStatus: 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface VisitorInvitationResponse {
  id: number;
  residentId: number;
  residentName: string;
  flatNumber?: string;
  buildingName?: string;
  hostPhone?: string;
  visitorName: string;
  visitorPhone: string;
  visitorCompany?: string;
  purpose?: string;
  expectedArrival?: string;
  expectedDeparture?: string;
  passStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  qrCodeToken?: string;
  approvedAt?: string;
  verifiedAt?: string;
  entryTime?: string;
  exitTime?: string;
  active: boolean;
}

export interface GateTokenVerificationResult {
  passType: 'RESIDENT' | 'VISITOR';
  valid: boolean;
  allowEntry: boolean;
  statusMessage: string;
  gatePassToken: string;
  personName: string;
  phoneNumber?: string;
  flatNumber?: string;
  buildingName?: string;
  occupancyType?: string;
  residentStatus?: string;
  purpose?: string;
  passStatus?: string;
  residentId?: number;
  invitationId?: number;
  entryTime?: string;
  exitTime?: string;
}

export interface QuickVisitorPassRequest {
  residentId: number;
  visitorName: string;
  visitorPhone: string;
  visitorCompany?: string;
  purpose?: string;
  isPreApproved?: boolean;
}

export interface TrustedVisitorRequest {
  residentId: number;
  visitorName: string;
  visitorPhone: string;
  visitorCompany?: string;
  notes?: string;
}

export interface TrustedVisitorResponse {
  id: number;
  residentId: number;
  residentName: string;
  visitorName: string;
  visitorPhone: string;
  visitorCompany?: string;
  notes?: string;
  active: boolean;
}

export interface ServiceProviderRequest {
  societyId: number;
  providerName: string;
  serviceType: string;
  contactPhone: string;
  contactEmail?: string;
  notes?: string;
}

export interface ServiceProviderResponse {
  id: number;
  societyId: number;
  societyName: string;
  providerName: string;
  serviceType: string;
  contactPhone: string;
  contactEmail?: string;
  notes?: string;
  active: boolean;
}
