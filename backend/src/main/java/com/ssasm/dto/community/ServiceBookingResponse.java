package com.ssasm.dto.community;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ServiceBookingResponse {

  private Long id;
  private Long residentId;
  private String residentName;
  private String serviceType;
  private String description;
  private LocalDateTime preferredTime;
  private String status;
  private boolean active;
}
