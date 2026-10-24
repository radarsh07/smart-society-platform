package com.ssasm.mapper.society;

import org.springframework.stereotype.Component;
import com.ssasm.entity.society.Flat;
import com.ssasm.response.society.FlatResponse;

/**
 * Manual mapper for flat entities.
 */
@Component
public class FlatMapper {

  public FlatResponse toResponse(Flat flat) {
    return FlatResponse.builder()
        .id(flat.getId())
        .buildingId(flat.getBuilding().getId())
        .buildingName(flat.getBuilding().getBuildingName())
        .societyId(flat.getBuilding().getSociety().getId())
        .societyName(flat.getBuilding().getSociety().getSocietyName())
        .flatNumber(flat.getFlatNumber())
        .flatType(flat.getFlatType())
        .floorNumber(flat.getFloorNumber())
        .carpetArea(flat.getCarpetArea())
        .status(flat.getStatus())
        .active(flat.isActive())
        .build();
  }
}
