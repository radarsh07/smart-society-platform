package com.ssasm.dto.community;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacilityBookingResponse {

  private Long id;
  private Long facilityId;
  private String facilityName;
  private Long residentId;
  private String residentName;
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private String status;
  private String notes;
  private boolean active;
}
