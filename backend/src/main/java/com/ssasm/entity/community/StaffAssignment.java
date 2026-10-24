package com.ssasm.entity.community;

import java.time.LocalDateTime;
import com.ssasm.entity.BaseEntity;
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
@Table(name = "staff_assignments")
public class StaffAssignment extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "staff_id", nullable = false)
  private Staff staff;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "complaint_id", nullable = false)
  private Complaint complaint;

  @Column(name = "assigned_at")
  private LocalDateTime assignedAt = LocalDateTime.now();

  @Column(name = "notes", length = 500)
  private String notes;
}
