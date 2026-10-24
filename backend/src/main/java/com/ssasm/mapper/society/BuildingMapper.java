package com.ssasm.mapper.society;

import org.springframework.stereotype.Component;
import com.ssasm.entity.society.Building;
import com.ssasm.response.society.BuildingResponse;

/**
 * Manual mapper for building entities.
 */
@Component
public class BuildingMapper {

  public BuildingResponse toResponse(Building building) {
    return BuildingResponse.builder()
        .id(building.getId())
        .societyId(building.getSociety().getId())
        .societyName(building.getSociety().getSocietyName())
        .buildingName(building.getBuildingName())
        .buildingCode(building.getBuildingCode())
        .totalFloors(building.getTotalFloors())
        .active(building.isActive())
        .build();
  }
}
