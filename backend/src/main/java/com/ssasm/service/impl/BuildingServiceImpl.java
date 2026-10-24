package com.ssasm.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.audit.DomainAuditEvent;
import com.ssasm.audit.DomainAuditService;
import com.ssasm.dto.society.BuildingRequest;
import com.ssasm.entity.society.Building;
import com.ssasm.entity.society.Society;
import com.ssasm.exception.BadRequestException;
import com.ssasm.exception.ResourceNotFoundException;
import com.ssasm.mapper.society.BuildingMapper;
import com.ssasm.repository.society.BuildingRepository;
import com.ssasm.repository.society.SocietyRepository;
import com.ssasm.response.PageResponse;
import com.ssasm.response.society.BuildingResponse;
import com.ssasm.service.society.BuildingService;
import com.ssasm.util.DateUtil;
import com.ssasm.util.PageResponseUtil;

/**
 * Implements building create, update, delete, and listing operations.
 */
@Service
@Transactional
public class BuildingServiceImpl implements BuildingService {

  private final BuildingRepository buildingRepository;
  private final SocietyRepository societyRepository;
  private final BuildingMapper buildingMapper;
  private final DomainAuditService domainAuditService;

  public BuildingServiceImpl(
      BuildingRepository buildingRepository,
      SocietyRepository societyRepository,
      BuildingMapper buildingMapper,
      DomainAuditService domainAuditService) {
    this.buildingRepository = buildingRepository;
    this.societyRepository = societyRepository;
    this.buildingMapper = buildingMapper;
    this.domainAuditService = domainAuditService;
  }

  @Override
  public BuildingResponse createBuilding(BuildingRequest request, String username, String ipAddress) {
    Society society = findSociety(request.getSocietyId());

    String code = request.getBuildingCode();
    if (code == null || code.trim().isEmpty()) {
      code = generateUniqueBuildingCode(request.getSocietyId(), request.getBuildingName());
    } else {
      code = code.trim().toUpperCase();
      validateUniqueness(request.getSocietyId(), code, null);
    }

    Building building = new Building();
    building.setSociety(society);
    building.setBuildingName(request.getBuildingName().trim());
    building.setBuildingCode(code);
    building.setTotalFloors(request.getTotalFloors());
    building.setCreatedBy(username);
    building.setUpdatedBy(username);
    Building saved = buildingRepository.save(building);

    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "Building", saved.getId().toString(), "SUCCESS", "Building created"));
    return buildingMapper.toResponse(saved);
  }

  @Override
  public BuildingResponse updateBuilding(Long buildingId, BuildingRequest request, String username, String ipAddress) {
    Building building = getBuildingEntity(buildingId);
    Society society = findSociety(request.getSocietyId());

    String code = request.getBuildingCode();
    if (code == null || code.trim().isEmpty()) {
      code = building.getBuildingCode();
    } else {
      code = code.trim().toUpperCase();
      validateUniqueness(request.getSocietyId(), code, buildingId);
    }

    building.setSociety(society);
    building.setBuildingName(request.getBuildingName().trim());
    building.setBuildingCode(code);
    building.setTotalFloors(request.getTotalFloors());
    building.setUpdatedBy(username);
    Building saved = buildingRepository.save(building);

    domainAuditService.log(buildEvent(username, ipAddress, "UPDATE", "Building", saved.getId().toString(), "SUCCESS", "Building updated"));
    return buildingMapper.toResponse(saved);
  }

  private String generateUniqueBuildingCode(Long societyId, String buildingName) {
    String prefix = "BLD";
    if (buildingName != null && !buildingName.trim().isEmpty()) {
      String clean = buildingName.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
      if (clean.length() >= 2) {
        prefix = clean.substring(0, Math.min(3, clean.length()));
      }
    }
    java.security.SecureRandom random = new java.security.SecureRandom();
    String code;
    do {
      int randomNum = 1000 + random.nextInt(9000);
      code = prefix + "-" + randomNum;
    } while (buildingRepository.existsBySocietyIdAndBuildingCodeIgnoreCaseAndDeletedFalse(societyId, code));
    return code;
  }

  @Override
  public void deleteBuilding(Long buildingId, String username, String ipAddress) {
    Building building = getBuildingEntity(buildingId);
    building.setDeleted(true);
    building.setActive(false);
    building.setUpdatedBy(username);
    buildingRepository.save(building);

    domainAuditService.log(buildEvent(username, ipAddress, "DELETE", "Building", buildingId.toString(), "SUCCESS", "Building soft deleted"));
  }

  @Override
  @Transactional(readOnly = true)
  public BuildingResponse getBuilding(Long buildingId) {
    return buildingMapper.toResponse(getBuildingEntity(buildingId));
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<BuildingResponse> listBuildings(Long societyId, int page, int size, String sortBy, String sortDirection) {
    Page<Building> result = buildingRepository.findBySocietyIdAndDeletedFalse(
        societyId,
        PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(buildingMapper::toResponse), sortBy, sortDirection);
  }

  private Building getBuildingEntity(Long buildingId) {
    return buildingRepository.findById(buildingId)
        .filter(building -> !building.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Building not found"));
  }

  private Society findSociety(Long societyId) {
    return societyRepository.findById(societyId)
        .filter(society -> !society.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Society not found"));
  }

  private void validateUniqueness(Long societyId, String buildingCode, Long buildingId) {
    if (buildingId == null) {
      if (buildingRepository.existsBySocietyIdAndBuildingCodeIgnoreCaseAndDeletedFalse(societyId, buildingCode)) {
        throw new BadRequestException("Building code already exists in this society");
      }
      return;
    }
    if (buildingRepository.existsBySocietyIdAndBuildingCodeIgnoreCaseAndDeletedFalseAndIdNot(societyId, buildingCode, buildingId)) {
      throw new BadRequestException("Building code already exists in this society");
    }
  }

  private DomainAuditEvent buildEvent(String username, String ipAddress, String action, String entityName, String entityId, String result, String detail) {
    return DomainAuditEvent.builder()
        .timestamp(DateUtil.nowUtc())
        .username(username)
        .role("SOCIETY_ADMIN")
        .ipAddress(ipAddress)
        .action(action)
        .entityName(entityName)
        .entityId(entityId)
        .result(result)
        .detail(detail)
        .build();
  }
}
