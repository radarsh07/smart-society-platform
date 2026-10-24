package com.ssasm.response.visitor;

import java.time.LocalDateTime;
import com.ssasm.enums.VisitorPassStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VisitorInvitationResponse {
  private Long id;
  private Long residentId;
  private String residentName;
  private String flatNumber;
  private String buildingName;
  private String hostPhone;
  private String visitorName;
  private String visitorPhone;
  private String visitorCompany;
  private String purpose;
  private LocalDateTime expectedArrival;
  private LocalDateTime expectedDeparture;
  private VisitorPassStatus passStatus;
  private String qrCodeToken;
  private LocalDateTime approvedAt;
  private LocalDateTime verifiedAt;
  private LocalDateTime entryTime;
  private LocalDateTime exitTime;
  private boolean active;
}
