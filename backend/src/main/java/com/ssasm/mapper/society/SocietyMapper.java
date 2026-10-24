package com.ssasm.mapper.society;

import org.springframework.stereotype.Component;
import com.ssasm.dto.society.SocietyRequest;
import com.ssasm.entity.society.Society;
import com.ssasm.response.society.SocietyResponse;

/**
 * Manual mapper for society entities.
 */
@Component
public class SocietyMapper {

  public SocietyResponse toResponse(Society society) {
    return toResponse(society, society.getBuildings() == null ? 0 : society.getBuildings().size(), 0);
  }

  public SocietyResponse toResponse(Society society, int buildingCount, int flatCount) {
    return SocietyResponse.builder()
        .id(society.getId())
        .societyName(society.getSocietyName())
        .registrationNumber(society.getRegistrationNumber())
        .addressLine1(society.getAddressLine1())
        .addressLine2(society.getAddressLine2())
        .city(society.getCity())
        .state(society.getState())
        .pincode(society.getPincode())
        .contactPhone(society.getContactPhone())
        .contactEmail(society.getContactEmail())
        .buildingCount(buildingCount)
        .flatCount(flatCount)
        .build();
  }

  public void updateEntity(Society society, SocietyRequest request) {
    society.setSocietyName(request.getSocietyName());
    society.setRegistrationNumber(request.getRegistrationNumber());
    society.setAddressLine1(request.getAddressLine1());
    society.setAddressLine2(request.getAddressLine2());
    society.setCity(request.getCity());
    society.setState(request.getState());
    society.setPincode(request.getPincode());
    society.setContactPhone(request.getContactPhone());
    society.setContactEmail(request.getContactEmail());
  }
}
