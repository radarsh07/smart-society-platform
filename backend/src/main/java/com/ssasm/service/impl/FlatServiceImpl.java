package com.ssasm.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.audit.DomainAuditEvent;
import com.ssasm.audit.DomainAuditService;
import com.ssasm.dto.society.FlatRequest;
import com.ssasm.dto.society.FlatSearchRequest;
import com.ssasm.entity.society.Building;
import com.ssasm.entity.society.Flat;
import com.ssasm.exception.BadRequestException;
import com.ssasm.exception.ResourceNotFoundException;
import com.ssasm.mapper.society.FlatMapper;
import com.ssasm.repository.society.BuildingRepository;
import com.ssasm.repository.society.FlatRepository;
import com.ssasm.response.PageResponse;
import com.ssasm.response.society.FlatResponse;
import com.ssasm.service.society.FlatService;
import com.ssasm.util.DateUtil;
import com.ssasm.util.PageResponseUtil;
import jakarta.persistence.criteria.JoinType;

/**
 * Implements flat create, update, delete, and search operations.
 */
@Service
@Transactional
public class FlatServiceImpl implements FlatService {

  private final FlatRepository flatRepository;
  private final BuildingRepository buildingRepository;
  private final FlatMapper flatMapper;
  private final DomainAuditService domainAuditService;

  public FlatServiceImpl(
      FlatRepository flatRepository,
      BuildingRepository buildingRepository,
      FlatMapper flatMapper,
      DomainAuditService domainAuditService) {
    this.flatRepository = flatRepository;
    this.buildingRepository = buildingRepository;
    this.flatMapper = flatMapper;
    this.domainAuditService = domainAuditService;
  }

  @Override
  public FlatResponse createFlat(FlatRequest request, String username, String ipAddress) {
    Building building = findBuilding(request.getBuildingId());
    validateUniqueness(request.getBuildingId(), request.getFlatNumber(), null);

    Flat flat = new Flat();
    flat.setBuilding(building);
    flat.setFlatNumber(request.getFlatNumber().trim().toUpperCase());
    flat.setFlatType(request.getFlatType().trim());
    flat.setFloorNumber(request.getFloorNumber());
    flat.setCarpetArea(request.getCarpetArea());
    flat.setStatus(request.getStatus().trim().toUpperCase());
    flat.setCreatedBy(username);
    flat.setUpdatedBy(username);
    Flat saved = flatRepository.save(flat);

    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "Flat", saved.getId().toString(), "SUCCESS", "Flat created"));
    return flatMapper.toResponse(saved);
  }

  @Override
  public FlatResponse updateFlat(Long flatId, FlatRequest request, String username, String ipAddress) {
    Flat flat = getFlatEntity(flatId);
    Building building = findBuilding(request.getBuildingId());
    validateUniqueness(request.getBuildingId(), request.getFlatNumber(), flatId);

    flat.setBuilding(building);
    flat.setFlatNumber(request.getFlatNumber().trim().toUpperCase());
    flat.setFlatType(request.getFlatType().trim());
    flat.setFloorNumber(request.getFloorNumber());
    flat.setCarpetArea(request.getCarpetArea());
    flat.setStatus(request.getStatus().trim().toUpperCase());
    flat.setUpdatedBy(username);
    Flat saved = flatRepository.save(flat);

    domainAuditService.log(buildEvent(username, ipAddress, "UPDATE", "Flat", saved.getId().toString(), "SUCCESS", "Flat updated"));
    return flatMapper.toResponse(saved);
  }

  @Override
  public void deleteFlat(Long flatId, String username, String ipAddress) {
    Flat flat = getFlatEntity(flatId);
    flat.setDeleted(true);
    flat.setActive(false);
    flat.setUpdatedBy(username);
    flatRepository.save(flat);

    domainAuditService.log(buildEvent(username, ipAddress, "DELETE", "Flat", flatId.toString(), "SUCCESS", "Flat soft deleted"));
  }

  @Override
  @Transactional(readOnly = true)
  public FlatResponse getFlat(Long flatId) {
    return flatMapper.toResponse(getFlatEntity(flatId));
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<FlatResponse> listFlats(FlatSearchRequest request) {
    Specification<Flat> specification = (root, query, builder) -> {
      query.distinct(true);
      var predicates = builder.conjunction();
      predicates = builder.and(predicates, builder.isFalse(root.get("deleted")));
      if (request.getFloorNumber() != null) {
        predicates = builder.and(predicates, builder.equal(root.get("floorNumber"), request.getFloorNumber()));
      }
      if (request.getFlatType() != null && !request.getFlatType().isBlank()) {
        predicates = builder.and(predicates, builder.like(builder.lower(root.get("flatType")), "%%" + request.getFlatType().toLowerCase() + "%%"));
      }
      if (request.getStatus() != null) {
        predicates = builder.and(predicates, builder.equal(builder.upper(root.get("status")), request.getStatus().name()));
      }
      if (request.getBuildingId() != null) {
        var buildingJoin = root.join("building", JoinType.INNER);
        predicates = builder.and(predicates, builder.equal(buildingJoin.get("id"), request.getBuildingId()));
      } else if (request.getBuildingName() != null && !request.getBuildingName().isBlank()) {
        var buildingJoin = root.join("building", JoinType.INNER);
        predicates = builder.and(predicates, builder.like(builder.lower(buildingJoin.get("buildingName")), "%%" + request.getBuildingName().toLowerCase() + "%%"));
      }
      return predicates;
    };

    Page<Flat> result = flatRepository.findAll(
        specification,
        PageRequest.of(request.getPage(), request.getSize(), PageResponseUtil.sort(request.getSortBy(), request.getSortDirection())));
    return PageResponseUtil.fromPage(result.map(flatMapper::toResponse), request.getSortBy(), request.getSortDirection());
  }

  private Flat getFlatEntity(Long flatId) {
    return flatRepository.findById(flatId)
        .filter(flat -> !flat.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));
  }

  private Building findBuilding(Long buildingId) {
    return buildingRepository.findById(buildingId)
        .filter(building -> !building.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Building not found"));
  }

  private void validateUniqueness(Long buildingId, String flatNumber, Long flatId) {
    if (flatId == null) {
      if (flatRepository.existsByBuildingIdAndFlatNumberIgnoreCaseAndDeletedFalse(buildingId, flatNumber)) {
        throw new BadRequestException("Flat number already exists in this building");
      }
      return;
    }
    if (flatRepository.existsByBuildingIdAndFlatNumberIgnoreCaseAndDeletedFalseAndIdNot(buildingId, flatNumber, flatId)) {
      throw new BadRequestException("Flat number already exists in this building");
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
