package com.ssasm.dto.community;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MaintenanceBillResponse {

  private Long id;
  private Long residentId;
  private String residentName;
  private String billNumber;
  private LocalDate billingMonth;
  private LocalDate dueDate;
  private BigDecimal totalAmount;
  private BigDecimal paidAmount;
  private BigDecimal outstandingAmount;
  private String status;
  private List<BillItemResponse> items;
  private boolean active;
}
