package com.ssasm.entity.community;

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
@Table(name = "complaint_categories")
public class ComplaintCategory extends BaseEntity {

  @NotBlank
  @Size(max = 100)
  @Column(name = "name", nullable = false, unique = true, length = 100)
  private String name;

  @Size(max = 255)
  @Column(name = "description", length = 255)
  private String description;
}
