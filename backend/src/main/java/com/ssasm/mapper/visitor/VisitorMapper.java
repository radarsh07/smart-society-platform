package com.ssasm.mapper.visitor;

import org.springframework.stereotype.Component;
import com.ssasm.entity.visitor.ServiceProvider;
import com.ssasm.entity.visitor.TrustedVisitor;
import com.ssasm.entity.visitor.VisitorInvitation;
import com.ssasm.response.visitor.ServiceProviderResponse;
import com.ssasm.response.visitor.TrustedVisitorResponse;
import com.ssasm.response.visitor.VisitorInvitationResponse;

@Component
public class VisitorMapper {

  public VisitorInvitationResponse toInvitationResponse(VisitorInvitation invitation) {
    String flatNo = "";
    String bldName = "";
    String hostContact = "";
    if (invitation.getResident() != null) {
      hostContact = invitation.getResident().getPhoneNumber();
      if (invitation.getResident().getFlat() != null) {
        flatNo = invitation.getResident().getFlat().getFlatNumber();
        if (invitation.getResident().getFlat().getBuilding() != null) {
          bldName = invitation.getResident().getFlat().getBuilding().getBuildingName();
        }
      }
    }

    return VisitorInvitationResponse.builder()
        .id(invitation.getId())
        .residentId(invitation.getResident() != null ? invitation.getResident().getId() : null)
        .residentName(invitation.getResident() != null ? invitation.getResident().getFullName() : "N/A")
        .flatNumber(flatNo)
        .buildingName(bldName)
        .hostPhone(hostContact)
        .visitorName(invitation.getVisitorName())
        .visitorPhone(invitation.getVisitorPhone())
        .visitorCompany(invitation.getVisitorCompany())
        .purpose(invitation.getPurpose())
        .expectedArrival(invitation.getExpectedArrival())
        .expectedDeparture(invitation.getExpectedDeparture())
        .passStatus(invitation.getPassStatus())
        .qrCodeToken(invitation.getQrCodeToken())
        .approvedAt(invitation.getApprovedAt())
        .verifiedAt(invitation.getVerifiedAt())
        .entryTime(invitation.getEntryTime())
        .exitTime(invitation.getExitTime())
        .active(invitation.isActive())
        .build();
  }

  public TrustedVisitorResponse toTrustedVisitorResponse(TrustedVisitor visitor) {
    return TrustedVisitorResponse.builder()
        .id(visitor.getId())
        .residentId(visitor.getResident().getId())
        .residentName(visitor.getResident().getFullName())
        .visitorName(visitor.getVisitorName())
        .visitorPhone(visitor.getVisitorPhone())
        .visitorCompany(visitor.getVisitorCompany())
        .notes(visitor.getNotes())
        .active(visitor.isActive())
        .build();
  }

  public ServiceProviderResponse toServiceProviderResponse(ServiceProvider provider) {
    return ServiceProviderResponse.builder()
        .id(provider.getId())
        .societyId(provider.getSociety().getId())
        .societyName(provider.getSociety().getSocietyName())
        .providerName(provider.getProviderName())
        .serviceType(provider.getServiceType())
        .contactPhone(provider.getContactPhone())
        .contactEmail(provider.getContactEmail())
        .notes(provider.getNotes())
        .active(provider.isActive())
        .build();
  }
}
