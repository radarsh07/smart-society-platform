package com.ssasm.dto.community;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.ssasm.enums.PaymentMethod;
import com.ssasm.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {

  private Long id;
  private Long billId;
  private String receiptNumber;
  private BigDecimal amountPaid;
  private PaymentMethod paymentMethod;
  private PaymentStatus paymentStatus;
  private String transactionId;
  private LocalDateTime paymentDate;
}
