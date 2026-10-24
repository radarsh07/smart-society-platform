package com.ssasm.dto.community;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ParcelResponse {

  private Long id;
  private Long residentId;
  private String residentName;
  private String trackingNumber;
  private String courierName;
  private String description;
  private LocalDateTime receivedAt;
  private String status;
  private boolean active;
}
