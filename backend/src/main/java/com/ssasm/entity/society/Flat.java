package com.ssasm.entity.society;

import com.ssasm.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

/**
 * Flat master linked to a specific building.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "flats")
public class Flat extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "building_id", nullable = false)
  private Building building;

  @NotBlank
  @Size(max = 30)
  @Column(name = "flat_number", nullable = false, length = 30)
  private String flatNumber;

  @NotBlank
  @Size(max = 30)
  @Column(name = "flat_type", nullable = false, length = 30)
  private String flatType;

  @NotNull
  @Column(name = "floor_number", nullable = false)
  private Integer floorNumber;

  @Column(name = "carpet_area")
  private Double carpetArea;

  @Column(name = "status", nullable = false, length = 20)
  private String status = "VACANT";

  @OneToMany(mappedBy = "flat")
  private List<Resident> residents = new ArrayList<>();
}
