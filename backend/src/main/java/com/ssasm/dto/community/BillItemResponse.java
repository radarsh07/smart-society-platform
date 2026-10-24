package com.ssasm.dto.community;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BillItemResponse {

  private Long id;
  private String name;
  private String description;
  private BigDecimal amount;
}
