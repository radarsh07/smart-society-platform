package com.ssasm.mapper.society;

import org.springframework.stereotype.Component;
import com.ssasm.entity.society.Resident;
import com.ssasm.enums.FlatOccupancyStatus;
import com.ssasm.enums.ResidentLifecycleStatus;
import com.ssasm.response.society.ResidentResponse;
import com.ssasm.response.society.ResidentSummaryResponse;

/**
 * Manual mapper for resident entities.
 */
@Component
public class ResidentMapper {

  public ResidentResponse toResponse(Resident resident) {
    return ResidentResponse.builder()
        .id(resident.getId())
        .userId(resident.getUser() != null ? resident.getUser().getId() : null)
        .username(resident.getUser() != null ? resident.getUser().getUsername() : null)
        .fullName(resident.getFullName())
        .profilePhotoUrl(resident.getProfilePhotoUrl())
        .email(resident.getEmail())
        .phoneNumber(resident.getPhoneNumber())
        .emergencyContactName(resident.getEmergencyContactName())
        .emergencyContactPhone(resident.getEmergencyContactPhone())
        .gender(safeGender(resident.getGender()))
        .dateOfBirth(resident.getDateOfBirth())
        .occupation(resident.getOccupation())
        .bloodGroup(resident.getBloodGroup())
        .governmentIdNumber(resident.getGovernmentIdNumber())
        .familyMembers(resident.getFamilyMembers() != null ? resident.getFamilyMembers() : java.util.Collections.emptyList())
        .flatId(resident.getFlat() != null ? resident.getFlat().getId() : null)
        .flatNumber(resident.getFlat() != null ? resident.getFlat().getFlatNumber() : "")
        .buildingId(resident.getFlat() != null && resident.getFlat().getBuilding() != null ? resident.getFlat().getBuilding().getId() : null)
        .buildingName(resident.getFlat() != null && resident.getFlat().getBuilding() != null ? resident.getFlat().getBuilding().getBuildingName() : "")
        .moveInDate(resident.getMoveInDate())
        .occupancyType(safeOccupancyType(resident.getOccupancyType()))
        .residentStatus(safeResidentStatus(resident.getResidentStatus()))
        .active(resident.isActive())
        .gatePassToken(computeGatePassToken(resident))
        .build();
  }

  public static String computeGatePassToken(Resident resident) {
    if (resident == null || resident.getId() == null) return "GP-RES-PENDING";
    String flatNum = (resident.getFlat() != null && resident.getFlat().getFlatNumber() != null)
        ? resident.getFlat().getFlatNumber().trim()
        : "UNIT";
    return "GP-RES-" + resident.getId() + "-" + flatNum;
  }

  private com.ssasm.enums.Gender safeGender(String val) {
    if (val == null || val.isBlank()) return null;
    try {
      return com.ssasm.enums.Gender.valueOf(val.trim().toUpperCase());
    } catch (Exception e) {
      return null;
    }
  }

  private com.ssasm.enums.OccupancyType safeOccupancyType(String val) {
    if (val == null || val.isBlank()) return com.ssasm.enums.OccupancyType.OWNER;
    try {
      return com.ssasm.enums.OccupancyType.valueOf(val.trim().toUpperCase());
    } catch (Exception e) {
      return com.ssasm.enums.OccupancyType.OWNER;
    }
  }

  private ResidentLifecycleStatus safeResidentStatus(String val) {
    if (val == null || val.isBlank()) return ResidentLifecycleStatus.ACTIVE;
    try {
      return ResidentLifecycleStatus.valueOf(val.trim().toUpperCase());
    } catch (Exception e) {
      return ResidentLifecycleStatus.ACTIVE;
    }
  }

  public ResidentSummaryResponse toSummaryResponse(Resident resident) {
    return ResidentSummaryResponse.builder()
        .id(resident.getId())
        .username(resident.getUser() != null ? resident.getUser().getUsername() : null)
        .fullName(resident.getFullName())
        .email(resident.getEmail())
        .phoneNumber(resident.getPhoneNumber())
        .flatNumber(resident.getFlat() != null ? resident.getFlat().getFlatNumber() : "")
        .buildingName(resident.getFlat() != null && resident.getFlat().getBuilding() != null ? resident.getFlat().getBuilding().getBuildingName() : "")
        .residentStatus(resident.getResidentStatus())
        .occupancyType(resident.getOccupancyType() != null ? resident.getOccupancyType() : "OWNER")
        .gatePassToken(computeGatePassToken(resident))
        .build();
  }
}
