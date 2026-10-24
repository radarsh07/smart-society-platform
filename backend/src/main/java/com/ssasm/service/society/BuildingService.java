package com.ssasm.service.society;

import org.springframework.data.domain.Page;
import com.ssasm.dto.society.BuildingRequest;
import com.ssasm.response.PageResponse;
import com.ssasm.response.society.BuildingResponse;

/**
 * Building management operations.
 */
public interface BuildingService {

  BuildingResponse createBuilding(BuildingRequest request, String username, String ipAddress);

  BuildingResponse updateBuilding(Long buildingId, BuildingRequest request, String username, String ipAddress);

  void deleteBuilding(Long buildingId, String username, String ipAddress);

  BuildingResponse getBuilding(Long buildingId);

  PageResponse<BuildingResponse> listBuildings(Long societyId, int page, int size, String sortBy, String sortDirection);
}
