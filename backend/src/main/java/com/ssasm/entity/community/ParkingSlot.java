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
@Table(name = "parking_slots")
public class ParkingSlot extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "society_id")
  private Society society;

  @NotBlank
  @Size(max = 50)
  @Column(name = "slot_number", nullable = false, unique = true, length = 50)
  private String slotNumber;

  @Column(name = "is_occupied")
  private boolean occupied = false;

  @Column(name = "slot_type", length = 30)
  private String slotType = "STANDARD";
}
