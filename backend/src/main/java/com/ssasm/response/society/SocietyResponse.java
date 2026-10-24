package com.ssasm.response.society;

import lombok.Builder;
import lombok.Getter;

/**
 * Society response DTO.
 */
@Getter
@Builder
public class SocietyResponse {

  private Long id;
  private String societyName;
  private String registrationNumber;
  private String addressLine1;
  private String addressLine2;
  private String city;
  private String state;
  private String pincode;
  private String contactPhone;
  private String contactEmail;
  private Integer buildingCount;
  private Integer flatCount;
}
