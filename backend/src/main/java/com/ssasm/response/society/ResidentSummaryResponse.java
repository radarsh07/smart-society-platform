package com.ssasm.response.society;

import lombok.Builder;
import lombok.Getter;

/**
 * Compact resident response for lists and security verification.
 */
@Getter
@Builder
public class ResidentSummaryResponse {

  private Long id;
  private String username;
  private String fullName;
  private String email;
  private String phoneNumber;
  private String flatNumber;
  private String buildingName;
  private String residentStatus;
  private String occupancyType;
  private String gatePassToken;
}
