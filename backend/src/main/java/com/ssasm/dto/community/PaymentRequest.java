package com.ssasm.dto.community;

import java.math.BigDecimal;
import com.ssasm.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {

  @NotNull
  private Long billId;

  @NotNull
  private BigDecimal amount;

  @NotNull
  private PaymentMethod paymentMethod;

  private String transactionId;

  private String razorpayOrderId;

  private String razorpayPaymentId;

  private String razorpaySignature;
}
