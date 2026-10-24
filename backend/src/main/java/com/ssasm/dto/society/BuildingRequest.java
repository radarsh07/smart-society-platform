package com.ssasm.dto.society;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for creating or updating a building.
 */
@Getter
@Setter
public class BuildingRequest {

  @NotNull
  private Long societyId;

  @NotBlank
  @Size(max = 120)
  private String buildingName;

  @NotBlank
  @Size(max = 30)
  private String buildingCode;

  @NotNull
  private Integer totalFloors;
}
