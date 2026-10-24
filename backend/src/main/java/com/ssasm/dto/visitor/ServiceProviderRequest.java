package com.ssasm.dto.visitor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceProviderRequest {

  @NotNull
  private Long societyId;

  @NotBlank
  @Size(max = 150)
  private String providerName;

  @NotBlank
  @Size(max = 100)
  private String serviceType;

  @NotBlank
  @Size(max = 20)
  private String contactPhone;

  @Size(max = 150)
  private String contactEmail;

  @Size(max = 255)
  private String notes;
}
