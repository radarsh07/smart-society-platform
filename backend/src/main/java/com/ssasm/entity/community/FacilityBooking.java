package com.ssasm.entity.community;

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
@Table(name = "facility_bookings")
public class FacilityBooking extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "facility_id", nullable = false)
  private Facility facility;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @NotNull
  @Column(name = "start_time", nullable = false)
  private LocalDateTime startTime;

  @NotNull
  @Column(name = "end_time", nullable = false)
  private LocalDateTime endTime;

  @Column(name = "status", length = 20)
  private String status = "PENDING";

  @Column(name = "notes", length = 500)
  private String notes;
}
