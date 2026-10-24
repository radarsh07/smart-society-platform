package com.ssasm.dto.society;

import com.ssasm.enums.FlatOccupancyStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Search and filter request for flats.
 */
@Getter
@Setter
public class FlatSearchRequest {

  private Long buildingId;

  @Size(max = 120)
  private String buildingName;

  private Integer floorNumber;

  @Size(max = 30)
  private String flatType;

  private FlatOccupancyStatus status;

  @Min(0)
  private Integer page = 0;

  @Min(1)
  private Integer size = 10;

  private String sortBy = "createdAt";

  private String sortDirection = "DESC";
}
