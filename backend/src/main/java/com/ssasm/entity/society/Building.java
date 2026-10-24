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
 * Building master under a society.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "buildings")
public class Building extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "society_id", nullable = false)
  private Society society;

  @NotBlank
  @Size(max = 120)
  @Column(name = "building_name", nullable = false, length = 120)
  private String buildingName;

  @NotBlank
  @Size(max = 30)
  @Column(name = "building_code", nullable = false, length = 30)
  private String buildingCode;

  @Column(name = "total_floors", nullable = false)
  private Integer totalFloors = 0;

  @OneToMany(mappedBy = "building")
  private List<Flat> flats = new ArrayList<>();
}
