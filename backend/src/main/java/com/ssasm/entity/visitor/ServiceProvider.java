package com.ssasm.entity.visitor;

import com.ssasm.entity.BaseEntity;
import com.ssasm.entity.society.Society;
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
 * Service providers such as maintenance, housekeeping, or delivery vendors.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "service_providers")
public class ServiceProvider extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "society_id", nullable = false)
  private Society society;

  @NotBlank
  @Size(max = 150)
  @Column(name = "provider_name", nullable = false, length = 150)
  private String providerName;

  @NotBlank
  @Size(max = 100)
  @Column(name = "service_type", nullable = false, length = 100)
  private String serviceType;

  @NotBlank
  @Size(max = 20)
  @Column(name = "contact_phone", nullable = false, length = 20)
  private String contactPhone;

  @Size(max = 150)
  @Column(name = "contact_email", length = 150)
  private String contactEmail;

  @Size(max = 255)
  @Column(name = "notes", length = 255)
  private String notes;
}
