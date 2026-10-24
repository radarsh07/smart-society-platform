package com.ssasm.dto.society;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for creating or updating a flat.
 */
@Getter
@Setter
public class FlatRequest {

  @NotNull
  private Long buildingId;

  @NotBlank
  @Size(max = 30)
  private String flatNumber;

  @NotBlank
  @Size(max = 30)
  private String flatType;

  @NotNull
  private Integer floorNumber;

  private Double carpetArea;

  @NotBlank
  @Size(max = 20)
  private String status;
}
