package com.ssasm.dto.visitor;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VisitorInvitationRequest {

  @NotNull
  private Long residentId;

  @NotBlank
  @Size(max = 150)
  private String visitorName;

  @NotBlank
  @Size(max = 20)
  private String visitorPhone;

  @Size(max = 100)
  private String visitorCompany;

  @Size(max = 255)
  private String purpose;

  private LocalDateTime expectedArrival;
  private LocalDateTime expectedDeparture;
}
