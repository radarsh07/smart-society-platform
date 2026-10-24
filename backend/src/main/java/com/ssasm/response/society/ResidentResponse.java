package com.ssasm.response.society;

import java.time.LocalDate;
import java.util.List;
import com.ssasm.enums.Gender;
import com.ssasm.enums.OccupancyType;
import com.ssasm.enums.ResidentLifecycleStatus;
import lombok.Builder;
import lombok.Getter;

/**
 * Full resident response DTO.
 */
@Getter
@Builder
public class ResidentResponse {

  private Long id;
  private Long userId;
  private String username;
  private String fullName;
  private String profilePhotoUrl;
  private String email;
  private String phoneNumber;
  private String emergencyContactName;
  private String emergencyContactPhone;
  private Gender gender;
  private LocalDate dateOfBirth;
  private String occupation;
  private String bloodGroup;
  private String governmentIdNumber;
  private List<String> familyMembers;
  private Long flatId;
  private String flatNumber;
  private Long buildingId;
  private String buildingName;
  private LocalDate moveInDate;
  private OccupancyType occupancyType;
  private ResidentLifecycleStatus residentStatus;
  private Boolean active;
  private String gatePassToken;
}
