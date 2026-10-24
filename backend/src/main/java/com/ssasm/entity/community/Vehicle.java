package com.ssasm.entity.community;

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
@Table(name = "vehicles")
public class Vehicle extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @NotBlank
  @Size(max = 20)
  @Column(name = "vehicle_number", nullable = false, unique = true, length = 20)
  private String vehicleNumber;

  @Size(max = 100)
  @Column(name = "make", length = 100)
  private String make;

  @Size(max = 100)
  @Column(name = "model", length = 100)
  private String model;

  @Size(max = 20)
  @Column(name = "color", length = 20)
  private String color;
}
