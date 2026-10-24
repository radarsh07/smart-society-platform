package com.ssasm.dto.community;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ToLetListingResponse {

  private Long id;
  private Long residentId;
  private String residentName;
  private String title;
  private String description;
  private BigDecimal rent;
  private String location;
  private String status;
  private boolean active;
}
