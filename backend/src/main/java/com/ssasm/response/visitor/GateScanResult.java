package com.ssasm.response.visitor;

import lombok.Builder;
import lombok.Getter;

/**
 * Gate scanner evaluation result for permanent resident and visitor tokens.
 */
@Getter
@Builder
public class GateScanResult {
  private String passType; // "RESIDENT" or "VISITOR"
  private boolean valid;
  private boolean allowEntry;
  private String statusMessage;
  private String gatePassToken;
  private String personName;
  private String phoneNumber;
  private String flatNumber;
  private String buildingName;
  private String occupancyType;
  private String residentStatus;
  private String purpose;
  private String passStatus;
  private Long residentId;
  private Long invitationId;
  private String entryTime;
  private String exitTime;
}
