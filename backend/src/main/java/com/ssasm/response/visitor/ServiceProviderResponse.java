package com.ssasm.response.visitor;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ServiceProviderResponse {
  private Long id;
  private Long societyId;
  private String societyName;
  private String providerName;
  private String serviceType;
  private String contactPhone;
  private String contactEmail;
  private String notes;
  private boolean active;
}
