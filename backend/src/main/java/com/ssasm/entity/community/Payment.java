package com.ssasm.entity.community;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.ssasm.entity.BaseEntity;
import com.ssasm.entity.society.Resident;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "bill_id", nullable = false)
  private MaintenanceBill bill;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @Column(name = "amount", precision = 12, scale = 2)
  private BigDecimal amount = BigDecimal.ZERO;

  @Column(name = "payment_method", length = 50)
  private String paymentMethod = "RAZORPAY";

  @Column(name = "transaction_id", unique = true, length = 100)
  private String transactionId;

  @Column(name = "payment_status", length = 30)
  private String paymentStatus = "PENDING";

  @Column(name = "payment_date")
  private LocalDateTime paymentDate;

  @Column(name = "receipt_url", length = 255)
  private String receiptUrl;
}
