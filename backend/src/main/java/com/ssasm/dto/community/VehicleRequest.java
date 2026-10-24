package com.ssasm.dto.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehicleRequest {

  @NotNull
  private Long residentId;

  @NotBlank
  @Size(max = 20)
  private String vehicleNumber;

  @Size(max = 100)
  private String make;

  @Size(max = 100)
  private String model;

  @Size(max = 20)
  private String color;
}
