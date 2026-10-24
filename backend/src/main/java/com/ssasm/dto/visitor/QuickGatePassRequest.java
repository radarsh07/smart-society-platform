package com.ssasm.dto.visitor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Quick visitor/guest gate pass request issued by Guard Desk or Resident.
 */
@Getter
@Setter
public class QuickGatePassRequest {

  @NotNull(message = "Resident / Flat selection is required")
  private Long residentId;

  @NotBlank(message = "Visitor name is required")
  private String visitorName;

  @NotBlank(message = "Visitor phone number is required")
  private String visitorPhone;

  private String visitorCompany;

  private String purpose;

  private Boolean isPreApproved;
}
