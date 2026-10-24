package com.ssasm.response.visitor;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TrustedVisitorResponse {
  private Long id;
  private Long residentId;
  private String residentName;
  private String visitorName;
  private String visitorPhone;
  private String visitorCompany;
  private String notes;
  private boolean active;
}
