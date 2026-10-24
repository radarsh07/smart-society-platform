package com.ssasm.entity.society;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.ssasm.entity.BaseEntity;
import com.ssasm.entity.auth.User;
import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.OneToOne;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Resident profile linked to login user and flat assignment.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "residents")
public class Resident extends BaseEntity {

  @NotNull
  @OneToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @NotNull
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "flat_id", nullable = false)
  private Flat flat;

  @NotBlank
  @Size(max = 150)
  @Column(name = "full_name", nullable = false, length = 150)
  private String fullName;

  @Size(max = 255)
  @Column(name = "profile_photo_url", length = 255)
  private String profilePhotoUrl;

  @NotBlank
  @Email
  @Size(max = 150)
  @Column(name = "email", nullable = false, unique = true, length = 150)
  private String email;

  @NotBlank
  @Size(max = 20)
  @Column(name = "phone_number", nullable = false, unique = true, length = 20)
  private String phoneNumber;

  @Size(max = 150)
  @Column(name = "emergency_contact_name", length = 150)
  private String emergencyContactName;

  @Size(max = 20)
  @Column(name = "emergency_contact_phone", length = 20)
  private String emergencyContactPhone;

  @Size(max = 20)
  @Column(name = "gender", length = 20)
  private String gender;

  @Column(name = "date_of_birth")
  private LocalDate dateOfBirth;

  @Size(max = 100)
  @Column(name = "occupation", length = 100)
  private String occupation;

  @Size(max = 20)
  @Column(name = "blood_group", length = 20)
  private String bloodGroup;

  @Size(max = 100)
  @Column(name = "government_id_number", length = 100)
  private String governmentIdNumber;

  @Column(name = "move_in_date")
  private LocalDate moveInDate;

  @Size(max = 20)
  @Column(name = "occupancy_type", length = 20)
  private String occupancyType;

  @Size(max = 50)
  @Column(name = "resident_status", nullable = false, length = 50)
  private String residentStatus = "ACTIVE";

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "resident_family_members", joinColumns = @JoinColumn(name = "resident_id"))
  @Column(name = "family_member_name")
  private List<String> familyMembers = new ArrayList<>();
}
