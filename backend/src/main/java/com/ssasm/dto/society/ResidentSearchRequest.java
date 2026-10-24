package com.ssasm.dto.society;

import com.ssasm.enums.ResidentLifecycleStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Search and filter request for residents.
 */
@Getter
@Setter
public class ResidentSearchRequest {

  @Size(max = 150)
  private String residentName;

  @Size(max = 30)
  private String flatNumber;

  @Size(max = 20)
  private String phoneNumber;

  @Size(max = 120)
  private String buildingName;

  private ResidentLifecycleStatus residentStatus;

  @Min(0)
  private Integer page = 0;

  @Min(1)
  private Integer size = 10;

  private String sortBy = "createdAt";

  private String sortDirection = "DESC";
}
