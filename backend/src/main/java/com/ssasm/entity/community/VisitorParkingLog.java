package com.ssasm.entity.community;

import java.time.LocalDateTime;
import com.ssasm.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "visitor_parking_logs")
public class VisitorParkingLog extends BaseEntity {

  @NotBlank
  @Size(max = 20)
  @Column(name = "vehicle_number", nullable = false, length = 20)
  private String vehicleNumber;

  @Size(max = 100)
  @Column(name = "visitor_name", length = 100)
  private String visitorName;

  @Column(name = "entry_time")
  private LocalDateTime entryTime = LocalDateTime.now();

  @Column(name = "exit_time")
  private LocalDateTime exitTime;

  @Column(name = "slot_number", length = 50)
  private String slotNumber;
}
