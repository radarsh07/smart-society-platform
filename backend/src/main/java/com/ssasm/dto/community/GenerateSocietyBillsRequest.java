package com.ssasm.dto.community;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GenerateSocietyBillsRequest {

  @NotBlank(message = "Bill type or title is required (e.g. Monthly Maintenance, Water Utility Surcharge, Diwali Festival Fund)")
  private String billType;

  private String description;

  @NotNull(message = "Bill amount is required")
  @DecimalMin(value = "1.0", message = "Amount must be at least 1.00")
  private BigDecimal amount;

  private LocalDate dueDate;
}

