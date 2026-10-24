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
@Table(name = "parcels")
public class Parcel extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @NotBlank
  @Size(max = 100)
  @Column(name = "tracking_number", nullable = false, unique = true, length = 100)
  private String trackingNumber;

  @Size(max = 200)
  @Column(name = "courier_name", length = 200)
  private String courierName;

  @Size(max = 500)
  @Column(name = "description", length = 500)
  private String description;

  @Column(name = "received_at")
  private LocalDateTime receivedAt = LocalDateTime.now();

  @Column(name = "status", length = 20)
  private String status = "RECEIVED";
}
