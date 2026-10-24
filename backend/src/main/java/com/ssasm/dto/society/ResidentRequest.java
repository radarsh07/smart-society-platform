package com.ssasm.dto.society;

import java.time.LocalDate;
import java.util.List;
import com.ssasm.enums.Gender;
import com.ssasm.enums.OccupancyType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for creating or updating a resident profile.
 */
@Getter
@Setter
public class ResidentRequest {

  @NotNull
  private Long buildingId;

  @NotNull
  private Long flatId;

  @NotBlank
  @Size(min = 3, max = 50)
  private String username;

  @NotBlank
  @Size(max = 150)
  private String fullName;

  @Size(max = 255)
  private String profilePhotoUrl;

  @NotBlank
  @Email
  @Size(max = 150)
  private String email;

  @NotBlank
  @Size(max = 20)
  private String phoneNumber;

  @Size(max = 150)
  private String emergencyContactName;

  @Size(max = 20)
  private String emergencyContactPhone;

  private Gender gender;

  private LocalDate dateOfBirth;

  @Size(max = 100)
  private String occupation;

  @Size(max = 20)
  private String bloodGroup;

  @Size(max = 100)
  private String governmentIdNumber;

  private LocalDate moveInDate;

  @NotNull
  private OccupancyType occupancyType;

  @Size(max = 50)
  private String residentStatus;

  @Size(min = 8, max = 100)
  private String initialPassword;

  private List<@Size(max = 150) String> familyMembers;
}
