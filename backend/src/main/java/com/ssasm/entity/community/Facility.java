package com.ssasm.entity.community;

import com.ssasm.entity.BaseEntity;
import com.ssasm.entity.society.Society;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "facilities")
public class Facility extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "society_id")
  private Society society;

  @NotBlank
  @Size(max = 100)
  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Size(max = 255)
  @Column(name = "description", length = 255)
  private String description;

  @Column(name = "booking_duration_minutes")
  private Integer bookingDurationMinutes = 60;
}
