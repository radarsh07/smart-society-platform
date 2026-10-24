package com.ssasm.entity.community;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.ssasm.entity.BaseEntity;
import com.ssasm.entity.society.Resident;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "maintenance_bills")
public class MaintenanceBill extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @Column(name = "bill_number", length = 50)
  private String billNumber;

  @Column(name = "billing_month")
  private LocalDate billingMonth;

  @Column(name = "due_date")
  private LocalDate dueDate;

  @Column(name = "total_amount", precision = 12, scale = 2)
  private BigDecimal totalAmount = BigDecimal.ZERO;

  @Column(name = "paid_amount", precision = 12, scale = 2)
  private BigDecimal paidAmount = BigDecimal.ZERO;

  @Column(name = "outstanding_amount", precision = 12, scale = 2)
  private BigDecimal outstandingAmount = BigDecimal.ZERO;

  @Column(name = "status", length = 20)
  private String status = "PENDING";

  @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<BillItem> items = new ArrayList<>();

  @OneToMany(mappedBy = "bill")
  private List<Payment> payments = new ArrayList<>();
}
