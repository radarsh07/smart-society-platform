package com.ssasm.dto.community;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VehicleResponse {

  private Long id;
  private Long residentId;
  private String residentName;
  private String vehicleNumber;
  private String make;
  private String model;
  private String color;
  private boolean active;
}
