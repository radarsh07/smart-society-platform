package com.ssasm.entity.visitor;

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

/**
 * Resident-approved visitor profile for repeat access.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "trusted_visitors")
public class TrustedVisitor extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @NotBlank
  @Size(max = 150)
  @Column(name = "visitor_name", nullable = false, length = 150)
  private String visitorName;

  @NotBlank
  @Size(max = 20)
  @Column(name = "visitor_phone", nullable = false, length = 20)
  private String visitorPhone;

  @Size(max = 100)
  @Column(name = "visitor_company", length = 100)
  private String visitorCompany;

  @Size(max = 255)
  @Column(name = "notes", length = 255)
  private String notes;
}
