package com.ssasm.response.society;

import lombok.Builder;
import lombok.Getter;

/**
 * Building response DTO.
 */
@Getter
@Builder
public class BuildingResponse {

  private Long id;
  private Long societyId;
  private String societyName;
  private String buildingName;
  private String buildingCode;
  private Integer totalFloors;
  private Boolean active;
}
