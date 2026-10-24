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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "service_bookings")
public class ServiceBooking extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @NotBlank
  @Size(max = 100)
  @Column(name = "service_type", nullable = false, length = 100)
  private String serviceType;

  @Size(max = 500)
  @Column(name = "description", length = 500)
  private String description;

  @Column(name = "preferred_time")
  private LocalDateTime preferredTime;

  @Column(name = "status", length = 20)
  private String status = "PENDING";
}
