package com.ssasm.response.society;

import lombok.Builder;
import lombok.Getter;

/**
 * Flat response DTO.
 */
@Getter
@Builder
public class FlatResponse {

  private Long id;
  private Long buildingId;
  private String buildingName;
  private Long societyId;
  private String societyName;
  private String flatNumber;
  private String flatType;
  private Integer floorNumber;
  private Double carpetArea;
  private String status;
  private Boolean active;
}
