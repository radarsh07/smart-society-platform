package com.ssasm.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.audit.DomainAuditEvent;
import com.ssasm.audit.DomainAuditService;
import com.ssasm.dto.society.ResidentRequest;
import com.ssasm.dto.society.ResidentSearchRequest;
import com.ssasm.entity.auth.Role;
import com.ssasm.entity.auth.User;
import com.ssasm.entity.society.Building;
import com.ssasm.entity.society.Flat;
import com.ssasm.entity.society.Resident;
import com.ssasm.enums.AccountStatus;
import com.ssasm.enums.ResidentLifecycleStatus;
import com.ssasm.enums.RoleName;
import com.ssasm.exception.BadRequestException;
import com.ssasm.exception.ResourceNotFoundException;
import com.ssasm.mapper.society.ResidentMapper;
import com.ssasm.repository.auth.RoleRepository;
import com.ssasm.repository.auth.UserRepository;
import com.ssasm.repository.society.BuildingRepository;
import com.ssasm.repository.society.FlatRepository;
import com.ssasm.repository.society.ResidentRepository;
import com.ssasm.response.PageResponse;
import com.ssasm.response.society.ResidentResponse;
import com.ssasm.response.society.ResidentSummaryResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.service.society.ResidentService;
import com.ssasm.util.DateUtil;
import com.ssasm.util.PageResponseUtil;
import jakarta.persistence.criteria.JoinType;

/**
 * Implements resident create, update, delete, search, and self-profile operations.
 */
@Service
@Transactional
public class ResidentServiceImpl implements ResidentService {

  private final ResidentRepository residentRepository;
  private final FlatRepository flatRepository;
  private final BuildingRepository buildingRepository;
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final ResidentMapper residentMapper;
  private final DomainAuditService domainAuditService;

  public ResidentServiceImpl(
      ResidentRepository residentRepository,
      FlatRepository flatRepository,
      BuildingRepository buildingRepository,
      UserRepository userRepository,
      RoleRepository roleRepository,
      PasswordEncoder passwordEncoder,
      ResidentMapper residentMapper,
      DomainAuditService domainAuditService) {
    this.residentRepository = residentRepository;
    this.flatRepository = flatRepository;
    this.buildingRepository = buildingRepository;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.passwordEncoder = passwordEncoder;
    this.residentMapper = residentMapper;
    this.domainAuditService = domainAuditService;
  }

  @Override
  public ResidentResponse createResident(ResidentRequest request, String username, String ipAddress) {
    if (request.getInitialPassword() == null || request.getInitialPassword().isBlank()) {
      throw new BadRequestException("Initial password is required");
    }
    validateResidentUniqueness(request, null, null);
    Flat flat = findFlat(request.getFlatId());

    Role residentRole = roleRepository.findByName(RoleName.RESIDENT)
        .orElseThrow(() -> new ResourceNotFoundException("Resident role not found"));
    User user = createResidentUser(request, residentRole, username);
    User savedUser = userRepository.save(user);

    Resident resident = new Resident();
    applyResidentRequest(resident, request, flat, savedUser);
    resident.setCreatedBy(username);
    resident.setUpdatedBy(username);
    Resident saved = residentRepository.save(resident);

    domainAuditService.log(buildEvent(username, "SOCIETY_ADMIN", ipAddress, "CREATE", "Resident", saved.getId().toString(), "SUCCESS", "Resident created"));
    return residentMapper.toResponse(saved);
  }

  @Override
  public ResidentResponse updateResident(Long residentId, ResidentRequest request, String username, String role, String ipAddress) {
    Resident resident = getResidentEntity(residentId);
    validateResidentUniqueness(request, residentId, resident.getUser().getId());
    Flat flat = findFlat(request.getFlatId());

    resident.setFlat(flat);
    applyResidentUpdates(resident, request);
    if (resident.getUser() != null) {
      if (request.getUsername() != null && !request.getUsername().isBlank()) {
        resident.getUser().setUsername(request.getUsername().trim().toLowerCase());
      }
      if (request.getInitialPassword() != null && !request.getInitialPassword().isBlank()) {
        resident.getUser().setPasswordHash(passwordEncoder.encode(request.getInitialPassword()));
      }
      resident.getUser().setEmail(request.getEmail().trim().toLowerCase());
      resident.getUser().setPhoneNumber(request.getPhoneNumber().trim());
      resident.getUser().setUpdatedBy(username);
      userRepository.save(resident.getUser());
    }
    resident.setUpdatedBy(username);
    Resident saved = residentRepository.save(resident);

    domainAuditService.log(buildEvent(username, role, ipAddress, "UPDATE", "Resident", saved.getId().toString(), "SUCCESS", "Resident updated"));
    return residentMapper.toResponse(saved);
  }

  @Override
  public ResidentResponse updateMyProfile(ResidentRequest request, UserPrincipal principal, String ipAddress) {
    Resident resident = residentRepository.findByUserUsernameIgnoreCaseAndDeletedFalse(principal.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("Resident profile not found"));
    return updateResident(resident.getId(), request, principal.getUsername(), principal.getRoleName(), ipAddress);
  }

  @Override
  public void deleteResident(Long residentId, String username, String ipAddress) {
    Resident resident = getResidentEntity(residentId);
    resident.setDeleted(true);
    resident.setActive(false);
    resident.setResidentStatus(ResidentLifecycleStatus.INACTIVE.name());
    resident.setUpdatedBy(username);
    if (resident.getUser() != null) {
      resident.getUser().setAccountStatus(AccountStatus.DISABLED);
      resident.getUser().setUpdatedBy(username);
      userRepository.save(resident.getUser());
    }
    residentRepository.save(resident);

    domainAuditService.log(buildEvent(username, "SOCIETY_ADMIN", ipAddress, "DELETE", "Resident", residentId.toString(), "SUCCESS", "Resident soft deleted"));
  }

  @Override
  @Transactional(readOnly = true)
  public ResidentResponse getResident(Long residentId) {
    return residentMapper.toResponse(getResidentEntity(residentId));
  }

  @Override
  @Transactional(readOnly = true)
  public ResidentSummaryResponse getResidentBasic(Long residentId) {
    return residentMapper.toSummaryResponse(getResidentEntity(residentId));
  }

  @Override
  @Transactional(readOnly = true)
  public ResidentResponse getMyProfile(UserPrincipal principal) {
    Resident resident = residentRepository.findByUserUsernameIgnoreCaseAndDeletedFalse(principal.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("Resident profile not found"));
    return residentMapper.toResponse(resident);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ResidentSummaryResponse> listResidents(int page, int size, String sortBy, String sortDirection) {
    Page<Resident> result = residentRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(residentMapper::toSummaryResponse), sortBy, sortDirection);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ResidentSummaryResponse> searchResidents(ResidentSearchRequest request) {
    Specification<Resident> specification = (root, query, builder) -> {
      query.distinct(true);
      var predicates = builder.conjunction();
      predicates = builder.and(predicates, builder.isFalse(root.get("deleted")));
      if (request.getResidentName() != null && !request.getResidentName().isBlank()) {
        predicates = builder.and(predicates, builder.like(builder.lower(root.get("fullName")), "%%" + request.getResidentName().toLowerCase() + "%%"));
      }
      if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
        predicates = builder.and(predicates, builder.like(builder.lower(root.get("phoneNumber")), "%%" + request.getPhoneNumber().toLowerCase() + "%%"));
      }
      if (request.getResidentStatus() != null) {
        predicates = builder.and(predicates, builder.equal(builder.upper(root.get("residentStatus")), request.getResidentStatus().name()));
      }
      if ((request.getFlatNumber() != null && !request.getFlatNumber().isBlank()) ||
          (request.getBuildingName() != null && !request.getBuildingName().isBlank())) {
        var flatJoin = root.join("flat", JoinType.INNER);
        if (request.getFlatNumber() != null && !request.getFlatNumber().isBlank()) {
          predicates = builder.and(predicates, builder.like(builder.lower(flatJoin.get("flatNumber")), "%%" + request.getFlatNumber().toLowerCase() + "%%"));
        }
        if (request.getBuildingName() != null && !request.getBuildingName().isBlank()) {
          var buildingJoin = flatJoin.join("building", JoinType.INNER);
          predicates = builder.and(predicates, builder.like(builder.lower(buildingJoin.get("buildingName")), "%%" + request.getBuildingName().toLowerCase() + "%%"));
        }
      }
      return predicates;
    };

    Page<Resident> result = residentRepository.findAll(
        specification,
        PageRequest.of(request.getPage(), request.getSize(), PageResponseUtil.sort(request.getSortBy(), request.getSortDirection())));
    return PageResponseUtil.fromPage(result.map(residentMapper::toSummaryResponse), request.getSortBy(), request.getSortDirection());
  }

  private Resident getResidentEntity(Long residentId) {
    return residentRepository.findById(residentId)
        .filter(resident -> !resident.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Resident not found"));
  }

  private Flat findFlat(Long flatId) {
    return flatRepository.findById(flatId)
        .filter(flat -> !flat.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Flat not found"));
  }

  private void validateResidentUniqueness(ResidentRequest request, Long residentId, Long authUserId) {
    String desiredUsername = (request.getUsername() != null && !request.getUsername().isBlank())
        ? request.getUsername().trim().toLowerCase()
        : request.getEmail().trim().toLowerCase();

    if (residentId == null) {
      if (userRepository.existsByUsernameIgnoreCase(desiredUsername)) {
        throw new BadRequestException("Username '" + desiredUsername + "' is already registered. Please choose a different unique username.");
      }
      if (residentRepository.existsByEmailIgnoreCaseAndDeletedFalse(request.getEmail())) {
        throw new BadRequestException("Email already exists");
      }
      if (residentRepository.existsByPhoneNumberAndDeletedFalse(request.getPhoneNumber())) {
        throw new BadRequestException("Phone number already exists");
      }
      if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
        throw new BadRequestException("Email already exists in authentication store");
      }
      if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
        throw new BadRequestException("Phone number already exists in authentication store");
      }
      return;
    }
    if (userRepository.existsByUsernameIgnoreCaseAndIdNot(desiredUsername, authUserId)) {
      throw new BadRequestException("Username '" + desiredUsername + "' is already registered. Please choose a different unique username.");
    }
    if (residentRepository.existsByEmailIgnoreCaseAndDeletedFalseAndIdNot(request.getEmail(), residentId)) {
      throw new BadRequestException("Email already exists");
    }
    if (residentRepository.existsByPhoneNumberAndDeletedFalseAndIdNot(request.getPhoneNumber(), residentId)) {
      throw new BadRequestException("Phone number already exists");
    }
    if (userRepository.existsByEmailIgnoreCaseAndIdNot(request.getEmail(), authUserId)) {
      throw new BadRequestException("Email already exists in authentication store");
    }
    if (userRepository.existsByPhoneNumberAndIdNot(request.getPhoneNumber(), authUserId)) {
      throw new BadRequestException("Phone number already exists in authentication store");
    }
  }

  private User createResidentUser(ResidentRequest request, Role residentRole, String username) {
    User user = new User();
    String desiredUsername = (request.getUsername() != null && !request.getUsername().isBlank())
        ? request.getUsername().trim().toLowerCase()
        : request.getEmail().trim().toLowerCase();
    user.setUsername(desiredUsername);
    user.setFullName(request.getFullName().trim());
    user.setEmail(request.getEmail().trim().toLowerCase());
    user.setPhoneNumber(request.getPhoneNumber().trim());
    user.setPasswordHash(passwordEncoder.encode(request.getInitialPassword()));
    user.setRole(residentRole);
    user.setAccountStatus(AccountStatus.ACTIVE);
    user.setCreatedBy(username);
    user.setUpdatedBy(username);
    return user;
  }

  private void applyResidentRequest(Resident resident, ResidentRequest request, Flat flat, User user) {
    resident.setFlat(flat);
    resident.setUser(user);
    applyResidentUpdates(resident, request);
  }

  private void applyResidentUpdates(Resident resident, ResidentRequest request) {
    resident.setFullName(request.getFullName().trim());
    resident.setProfilePhotoUrl(request.getProfilePhotoUrl());
    resident.setEmail(request.getEmail().trim().toLowerCase());
    resident.setPhoneNumber(request.getPhoneNumber().trim());
    resident.setEmergencyContactName(request.getEmergencyContactName());
    resident.setEmergencyContactPhone(request.getEmergencyContactPhone());
    resident.setGender(request.getGender() == null ? null : request.getGender().name());
    resident.setDateOfBirth(request.getDateOfBirth());
    resident.setOccupation(request.getOccupation());
    resident.setBloodGroup(request.getBloodGroup());
    resident.setGovernmentIdNumber(request.getGovernmentIdNumber());
    resident.setMoveInDate(request.getMoveInDate() == null ? resident.getMoveInDate() : request.getMoveInDate());
    resident.setOccupancyType(request.getOccupancyType().name());
    resident.setResidentStatus(request.getResidentStatus() == null ? ResidentLifecycleStatus.ACTIVE.name() : request.getResidentStatus().trim().toUpperCase());
    resident.setFamilyMembers(request.getFamilyMembers() == null ? new ArrayList<>() : new ArrayList<>(request.getFamilyMembers()));
  }

  @Override
  public ResidentResponse selfRegister(com.ssasm.dto.society.ResidentSelfRegistrationRequest request, String ipAddress) {
    String desiredUsername = request.getUsername().trim().toLowerCase();
    if (userRepository.existsByUsernameIgnoreCase(desiredUsername)) {
      throw new BadRequestException("Username '" + request.getUsername() + "' is already taken. Please choose a different unique username.");
    }
    if (residentRepository.existsByEmailIgnoreCaseAndDeletedFalse(request.getEmail())) {
      throw new BadRequestException("Email already exists in society records");
    }
    if (residentRepository.existsByPhoneNumberAndDeletedFalse(request.getPhoneNumber())) {
      throw new BadRequestException("Phone number already exists in society records");
    }
    if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
      throw new BadRequestException("Email already registered in system");
    }
    if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
      throw new BadRequestException("Phone number already registered in system");
    }

    Flat flat = findFlat(request.getFlatId());
    Role residentRole = roleRepository.findByName(RoleName.RESIDENT)
        .orElseThrow(() -> new ResourceNotFoundException("Resident role not found"));

    User user = new User();
    user.setUsername(desiredUsername);
    user.setFullName(request.getFullName().trim());
    user.setEmail(request.getEmail().trim().toLowerCase());
    user.setPhoneNumber(request.getPhoneNumber().trim());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setRole(residentRole);
    user.setAccountStatus(AccountStatus.PENDING);
    user.setCreatedBy("SELF_REGISTRATION");
    user.setUpdatedBy("SELF_REGISTRATION");
    User savedUser = userRepository.save(user);

    Resident resident = new Resident();
    resident.setFlat(flat);
    resident.setUser(savedUser);
    resident.setFullName(request.getFullName().trim());
    resident.setEmail(request.getEmail().trim().toLowerCase());
    resident.setPhoneNumber(request.getPhoneNumber().trim());
    resident.setOccupancyType(request.getOccupancyType().name());
    resident.setResidentStatus(ResidentLifecycleStatus.PENDING_APPROVAL.name());
    resident.setCreatedBy("SELF_REGISTRATION");
    resident.setUpdatedBy("SELF_REGISTRATION");
    Resident saved = residentRepository.save(resident);

    domainAuditService.log(buildEvent(desiredUsername, "RESIDENT", ipAddress, "SELF_REGISTER", "Resident", saved.getId().toString(), "PENDING", "Resident submitted self-registration"));
    return residentMapper.toResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public java.util.List<ResidentSummaryResponse> getPendingApprovals() {
    return residentRepository.findByResidentStatusAndDeletedFalse(ResidentLifecycleStatus.PENDING_APPROVAL.name())
        .stream()
        .map(residentMapper::toSummaryResponse)
        .toList();
  }

  @Override
  public ResidentResponse approveResident(Long residentId, String adminUsername, String ipAddress) {
    Resident resident = getResidentEntity(residentId);
    resident.setResidentStatus(ResidentLifecycleStatus.ACTIVE.name());
    resident.setUpdatedBy(adminUsername);

    if (resident.getUser() != null) {
      resident.getUser().setAccountStatus(AccountStatus.ACTIVE);
      resident.getUser().setUpdatedBy(adminUsername);
      userRepository.save(resident.getUser());
    }

    if (resident.getFlat() != null) {
      resident.getFlat().setStatus("OCCUPIED");
      flatRepository.save(resident.getFlat());
    }

    Resident saved = residentRepository.save(resident);
    domainAuditService.log(buildEvent(adminUsername, "SOCIETY_ADMIN", ipAddress, "APPROVE", "Resident", residentId.toString(), "SUCCESS", "Resident registration approved"));
    return residentMapper.toResponse(saved);
  }

  @Override
  public ResidentResponse rejectResident(Long residentId, String adminUsername, String ipAddress) {
    Resident resident = getResidentEntity(residentId);
    resident.setResidentStatus(ResidentLifecycleStatus.REJECTED.name());
    resident.setUpdatedBy(adminUsername);

    if (resident.getUser() != null) {
      resident.getUser().setAccountStatus(AccountStatus.DISABLED);
      resident.getUser().setUpdatedBy(adminUsername);
      userRepository.save(resident.getUser());
    }

    Resident saved = residentRepository.save(resident);
    domainAuditService.log(buildEvent(adminUsername, "SOCIETY_ADMIN", ipAddress, "REJECT", "Resident", residentId.toString(), "SUCCESS", "Resident registration rejected"));
    return residentMapper.toResponse(saved);
  }

  private DomainAuditEvent buildEvent(String username, String role, String ipAddress, String action, String entityName, String entityId, String result, String detail) {
    return DomainAuditEvent.builder()
        .timestamp(DateUtil.nowUtc())
        .username(username)
        .role(role)
        .ipAddress(ipAddress)
        .action(action)
        .entityName(entityName)
        .entityId(entityId)
        .result(result)
        .detail(detail)
        .build();
  }
}
