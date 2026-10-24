package com.ssasm.dto.community;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FacilityBookingRequest {

  @NotNull
  private Long facilityId;

  @NotNull
  private Long residentId;

  @NotNull
  private LocalDateTime startTime;

  @NotNull
  private LocalDateTime endTime;

  private String notes;
}
