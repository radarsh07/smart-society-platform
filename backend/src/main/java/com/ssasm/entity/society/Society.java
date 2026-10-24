package com.ssasm.entity.society;

import com.ssasm.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

/**
 * Master society record for the single-society deployment.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "societies")
public class Society extends BaseEntity {

  @NotBlank
  @Size(max = 150)
  @Column(name = "society_name", nullable = false, unique = true, length = 150)
  private String societyName;

  @Size(max = 100)
  @Column(name = "registration_number", unique = true, length = 100)
  private String registrationNumber;

  @NotBlank
  @Size(max = 255)
  @Column(name = "address_line1", nullable = false, length = 255)
  private String addressLine1;

  @Size(max = 255)
  @Column(name = "address_line2", length = 255)
  private String addressLine2;

  @NotBlank
  @Size(max = 100)
  @Column(name = "city", nullable = false, length = 100)
  private String city;

  @NotBlank
  @Size(max = 100)
  @Column(name = "state", nullable = false, length = 100)
  private String state;

  @NotBlank
  @Size(max = 20)
  @Column(name = "pincode", nullable = false, length = 20)
  private String pincode;

  @Size(max = 20)
  @Column(name = "contact_phone", length = 20)
  private String contactPhone;

  @Size(max = 150)
  @Column(name = "contact_email", length = 150)
  private String contactEmail;

  @OneToMany(mappedBy = "society")
  private List<Building> buildings = new ArrayList<>();
}
