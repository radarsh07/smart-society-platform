package com.ssasm.entity.community;

import java.time.LocalDate;
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
@Table(name = "staff_attendance")
public class StaffAttendance extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "staff_id", nullable = false)
  private Staff staff;

  @NotNull
  @Column(name = "attendance_date", nullable = false)
  private LocalDate attendanceDate;

  @Column(name = "checked_in", length = 20)
  private String checkedIn;

  @Column(name = "checked_out", length = 20)
  private String checkedOut;

  @Column(name = "status", length = 20)
  private String status = "PRESENT";
}
