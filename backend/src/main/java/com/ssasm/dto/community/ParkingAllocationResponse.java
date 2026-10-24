package com.ssasm.dto.community;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ParkingAllocationResponse {

  private Long id;
  private Long residentId;
  private String residentName;
  private Long slotId;
  private String slotNumber;
  private Long vehicleId;
  private String vehicleNumber;
  private LocalDateTime allocatedAt;
  private LocalDateTime expiresAt;
  private boolean active;
}
