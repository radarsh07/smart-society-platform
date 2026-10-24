package com.ssasm.service.impl;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.audit.DomainAuditEvent;
import com.ssasm.audit.DomainAuditService;
import com.ssasm.dto.society.SocietyRequest;
import com.ssasm.entity.society.Society;
import com.ssasm.exception.BadRequestException;
import com.ssasm.exception.ResourceNotFoundException;
import com.ssasm.mapper.society.SocietyMapper;
import com.ssasm.repository.society.BuildingRepository;
import com.ssasm.repository.society.FlatRepository;
import com.ssasm.repository.society.SocietyRepository;
import com.ssasm.response.society.SocietyResponse;
import com.ssasm.service.society.SocietyService;
import com.ssasm.util.DateUtil;

/**
 * Implements society create, update, and read operations.
 */
@Service
@Transactional
public class SocietyServiceImpl implements SocietyService {

  private final SocietyRepository societyRepository;
  private final BuildingRepository buildingRepository;
  private final FlatRepository flatRepository;
  private final SocietyMapper societyMapper;
  private final DomainAuditService domainAuditService;

  public SocietyServiceImpl(
      SocietyRepository societyRepository,
      BuildingRepository buildingRepository,
      FlatRepository flatRepository,
      SocietyMapper societyMapper,
      DomainAuditService domainAuditService) {
    this.societyRepository = societyRepository;
    this.buildingRepository = buildingRepository;
    this.flatRepository = flatRepository;
    this.societyMapper = societyMapper;
    this.domainAuditService = domainAuditService;
  }

  @Override
  public SocietyResponse createSociety(SocietyRequest request, String username, String ipAddress) {
    Optional<Society> existing = societyRepository.findFirstByDeletedFalseOrderByIdAsc();
    if (existing.isPresent()) {
      return updateSociety(existing.get().getId(), request, username, ipAddress);
    }
    validateUniqueness(null, request);

    Society society = new Society();
    societyMapper.updateEntity(society, request);
    society.setCreatedBy(username);
    society.setUpdatedBy(username);
    Society saved = societyRepository.save(society);

    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "Society", saved.getId().toString(), "SUCCESS", "Society created"));
    return toResponse(saved);
  }

  @Override
  public SocietyResponse updateSociety(Long societyId, SocietyRequest request, String username, String ipAddress) {
    Society society = getSocietyEntity(societyId);
    validateUniqueness(societyId, request);
    societyMapper.updateEntity(society, request);
    society.setUpdatedBy(username);
    Society saved = societyRepository.save(society);

    domainAuditService.log(buildEvent(username, ipAddress, "UPDATE", "Society", saved.getId().toString(), "SUCCESS", "Society updated"));
    return toResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public SocietyResponse getSociety(Long societyId) {
    return toResponse(getSocietyEntity(societyId));
  }

  @Override
  @Transactional(readOnly = true)
  public SocietyResponse getCurrentSociety() {
    return societyRepository.findFirstByDeletedFalseOrderByIdAsc()
        .map(this::toResponse)
        .orElse(null);
  }

  private Society getSocietyEntity(Long societyId) {
    return societyRepository.findById(societyId)
        .filter(society -> !society.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Society not found"));
  }

  private void validateUniqueness(Long societyId, SocietyRequest request) {
    if (societyId == null) {
      if (societyRepository.existsBySocietyNameIgnoreCaseAndDeletedFalse(request.getSocietyName())) {
        throw new BadRequestException("Society name already exists");
      }
      if (request.getRegistrationNumber() != null
          && societyRepository.existsByRegistrationNumberIgnoreCaseAndDeletedFalse(request.getRegistrationNumber())) {
        throw new BadRequestException("Registration number already exists");
      }
      return;
    }

    if (societyRepository.existsBySocietyNameIgnoreCaseAndDeletedFalseAndIdNot(request.getSocietyName(), societyId)) {
      throw new BadRequestException("Society name already exists");
    }
    if (request.getRegistrationNumber() != null
        && societyRepository.existsByRegistrationNumberIgnoreCaseAndDeletedFalseAndIdNot(request.getRegistrationNumber(), societyId)) {
      throw new BadRequestException("Registration number already exists");
    }
  }

  private SocietyResponse toResponse(Society society) {
    long buildingCount = buildingRepository.countBySocietyIdAndDeletedFalse(society.getId());
    long flatCount = flatRepository.countByBuildingSocietyIdAndDeletedFalse(society.getId());
    return societyMapper.toResponse(society, (int) buildingCount, (int) flatCount);
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
