package com.ssasm.service.society;

import com.ssasm.dto.society.ResidentRequest;
import com.ssasm.dto.society.ResidentSearchRequest;
import com.ssasm.response.PageResponse;
import com.ssasm.response.society.ResidentResponse;
import com.ssasm.response.society.ResidentSummaryResponse;
import com.ssasm.security.UserPrincipal;

/**
 * Resident management operations.
 */
public interface ResidentService {

  ResidentResponse createResident(ResidentRequest request, String username, String ipAddress);

  ResidentResponse updateResident(Long residentId, ResidentRequest request, String username, String role, String ipAddress);

  ResidentResponse updateMyProfile(ResidentRequest request, UserPrincipal principal, String ipAddress);

  void deleteResident(Long residentId, String username, String ipAddress);

  ResidentResponse getResident(Long residentId);

  ResidentSummaryResponse getResidentBasic(Long residentId);

  ResidentResponse getMyProfile(UserPrincipal principal);

  PageResponse<ResidentSummaryResponse> listResidents(int page, int size, String sortBy, String sortDirection);

  PageResponse<ResidentSummaryResponse> searchResidents(ResidentSearchRequest request);

  ResidentResponse selfRegister(com.ssasm.dto.society.ResidentSelfRegistrationRequest request, String ipAddress);

  java.util.List<ResidentSummaryResponse> getPendingApprovals();

  ResidentResponse approveResident(Long residentId, String adminUsername, String ipAddress);

  ResidentResponse rejectResident(Long residentId, String adminUsername, String ipAddress);
}
