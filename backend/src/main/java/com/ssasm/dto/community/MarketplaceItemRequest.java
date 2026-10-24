package com.ssasm.dto.community;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarketplaceItemRequest {

  @NotNull
  private Long residentId;

  @NotBlank
  @Size(max = 100)
  private String title;

  @Size(max = 500)
  private String description;

  private BigDecimal price;

  @Size(max = 50)
  private String category;
}
