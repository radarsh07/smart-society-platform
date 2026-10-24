package com.ssasm.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.audit.DomainAuditEvent;
import com.ssasm.audit.DomainAuditService;
import com.ssasm.dto.visitor.ServiceProviderRequest;
import com.ssasm.dto.visitor.TrustedVisitorRequest;
import com.ssasm.dto.visitor.VisitorApprovalRequest;
import com.ssasm.dto.visitor.VisitorInvitationRequest;
import com.ssasm.entity.society.Resident;
import com.ssasm.entity.society.Society;
import com.ssasm.entity.visitor.ServiceProvider;
import com.ssasm.entity.visitor.TrustedVisitor;
import com.ssasm.entity.visitor.VisitorInvitation;
import com.ssasm.enums.VisitorPassStatus;
import com.ssasm.exception.BadRequestException;
import com.ssasm.exception.ResourceNotFoundException;
import com.ssasm.mapper.visitor.VisitorMapper;
import com.ssasm.repository.society.ResidentRepository;
import com.ssasm.repository.society.SocietyRepository;
import com.ssasm.repository.visitor.ServiceProviderRepository;
import com.ssasm.repository.visitor.TrustedVisitorRepository;
import com.ssasm.repository.visitor.VisitorInvitationRepository;
import com.ssasm.response.PageResponse;
import com.ssasm.response.visitor.ServiceProviderResponse;
import com.ssasm.response.visitor.TrustedVisitorResponse;
import com.ssasm.response.visitor.VisitorInvitationResponse;
import com.ssasm.service.visitor.VisitorService;
import com.ssasm.util.DateUtil;
import com.ssasm.util.PageResponseUtil;

@Service
@Transactional
public class VisitorServiceImpl implements VisitorService {

  private final VisitorInvitationRepository invitationRepository;
  private final TrustedVisitorRepository trustedVisitorRepository;
  private final ServiceProviderRepository serviceProviderRepository;
  private final ResidentRepository residentRepository;
  private final SocietyRepository societyRepository;
  private final VisitorMapper visitorMapper;
  private final DomainAuditService domainAuditService;

  public VisitorServiceImpl(
      VisitorInvitationRepository invitationRepository,
      TrustedVisitorRepository trustedVisitorRepository,
      ServiceProviderRepository serviceProviderRepository,
      ResidentRepository residentRepository,
      SocietyRepository societyRepository,
      VisitorMapper visitorMapper,
      DomainAuditService domainAuditService) {
    this.invitationRepository = invitationRepository;
    this.trustedVisitorRepository = trustedVisitorRepository;
    this.serviceProviderRepository = serviceProviderRepository;
    this.residentRepository = residentRepository;
    this.societyRepository = societyRepository;
    this.visitorMapper = visitorMapper;
    this.domainAuditService = domainAuditService;
  }

  @Override
  public VisitorInvitationResponse createInvitation(VisitorInvitationRequest request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId());
    VisitorInvitation invitation = new VisitorInvitation();
    invitation.setResident(resident);
    invitation.setVisitorName(request.getVisitorName().trim());
    invitation.setVisitorPhone(request.getVisitorPhone().trim());
    invitation.setVisitorCompany(request.getVisitorCompany() == null ? null : request.getVisitorCompany().trim());
    invitation.setPurpose(request.getPurpose() == null ? null : request.getPurpose().trim());
    invitation.setExpectedArrival(request.getExpectedArrival());
    invitation.setExpectedDeparture(request.getExpectedDeparture());
    invitation.setQrCodeToken(UUID.randomUUID().toString());
    invitation.setCreatedBy(username);
    invitation.setUpdatedBy(username);
    VisitorInvitation saved = invitationRepository.save(invitation);

    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "VisitorInvitation", saved.getId().toString(), "SUCCESS", "Visitor invitation created"));
    return visitorMapper.toInvitationResponse(saved);
  }

  @Override
  public VisitorInvitationResponse approveInvitation(Long invitationId, VisitorApprovalRequest request, String username, String ipAddress) {
    VisitorInvitation invitation = getInvitation(invitationId);
    if (request.getPassStatus() == VisitorPassStatus.APPROVED) {
      invitation.setPassStatus(VisitorPassStatus.APPROVED);
      invitation.setApprovedAt(LocalDateTime.now());
    } else if (request.getPassStatus() == VisitorPassStatus.REJECTED) {
      invitation.setPassStatus(VisitorPassStatus.REJECTED);
    } else {
      throw new BadRequestException("Only APPROVED or REJECTED is allowed for this action");
    }
    invitation.setUpdatedBy(username);
    VisitorInvitation saved = invitationRepository.save(invitation);

    domainAuditService.log(buildEvent(username, ipAddress, "UPDATE", "VisitorInvitation", saved.getId().toString(), "SUCCESS", "Visitor invitation updated"));
    return visitorMapper.toInvitationResponse(saved);
  }

  @Override
  public VisitorInvitationResponse verifyInvitation(String qrCodeToken, String username, String ipAddress) {
    VisitorInvitation invitation = invitationRepository.findByQrCodeTokenAndDeletedFalse(qrCodeToken)
        .orElseThrow(() -> new ResourceNotFoundException("Visitor invitation not found"));
    if (invitation.getPassStatus() != VisitorPassStatus.APPROVED && invitation.getPassStatus() != VisitorPassStatus.ACTIVE) {
      throw new BadRequestException("Visitor invitation is not approved for entry");
    }
    invitation.setPassStatus(VisitorPassStatus.ACTIVE);
    invitation.setVerifiedAt(LocalDateTime.now());
    invitation.setEntryTime(LocalDateTime.now());
    invitation.setUpdatedBy(username);
    VisitorInvitation saved = invitationRepository.save(invitation);

    domainAuditService.log(buildEvent(username, ipAddress, "VERIFY", "VisitorInvitation", saved.getId().toString(), "SUCCESS", "Visitor entry verified"));
    return visitorMapper.toInvitationResponse(saved);
  }

  @Override
  public void deleteInvitation(Long invitationId, String username, String ipAddress) {
    VisitorInvitation invitation = getInvitation(invitationId);
    invitation.setDeleted(true);
    invitation.setActive(false);
    invitation.setUpdatedBy(username);
    invitationRepository.save(invitation);
    domainAuditService.log(buildEvent(username, ipAddress, "DELETE", "VisitorInvitation", invitationId.toString(), "SUCCESS", "Visitor invitation soft deleted"));
  }

  @Override
  public VisitorInvitationResponse recordExit(Long invitationId, String username, String ipAddress) {
    VisitorInvitation invitation = getInvitation(invitationId);
    invitation.setExitTime(LocalDateTime.now());
    invitation.setPassStatus(VisitorPassStatus.USED);
    invitation.setUpdatedBy(username);
    VisitorInvitation saved = invitationRepository.save(invitation);
    domainAuditService.log(buildEvent(username, ipAddress, "EXIT", "VisitorInvitation", saved.getId().toString(), "SUCCESS", "Visitor exit recorded"));
    return visitorMapper.toInvitationResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<VisitorInvitationResponse> listInvitations(int page, int size, String sortBy, String sortDirection) {
    Page<VisitorInvitation> result = invitationRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(visitorMapper::toInvitationResponse), sortBy, sortDirection);
  }

  @Override
  public TrustedVisitorResponse createTrustedVisitor(TrustedVisitorRequest request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId());
    if (trustedVisitorRepository.findByResidentIdAndVisitorPhoneAndDeletedFalse(resident.getId(), request.getVisitorPhone().trim()).isPresent()) {
      throw new BadRequestException("Trusted visitor already exists for this resident");
    }
    TrustedVisitor visitor = new TrustedVisitor();
    visitor.setResident(resident);
    visitor.setVisitorName(request.getVisitorName().trim());
    visitor.setVisitorPhone(request.getVisitorPhone().trim());
    visitor.setVisitorCompany(request.getVisitorCompany() == null ? null : request.getVisitorCompany().trim());
    visitor.setNotes(request.getNotes() == null ? null : request.getNotes().trim());
    visitor.setCreatedBy(username);
    visitor.setUpdatedBy(username);
    TrustedVisitor saved = trustedVisitorRepository.save(visitor);

    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "TrustedVisitor", saved.getId().toString(), "SUCCESS", "Trusted visitor created"));
    return visitorMapper.toTrustedVisitorResponse(saved);
  }

  @Override
  public void deleteTrustedVisitor(Long trustedVisitorId, String username, String ipAddress) {
    TrustedVisitor visitor = getTrustedVisitor(trustedVisitorId);
    visitor.setDeleted(true);
    visitor.setActive(false);
    visitor.setUpdatedBy(username);
    trustedVisitorRepository.save(visitor);
    domainAuditService.log(buildEvent(username, ipAddress, "DELETE", "TrustedVisitor", trustedVisitorId.toString(), "SUCCESS", "Trusted visitor soft deleted"));
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<TrustedVisitorResponse> listTrustedVisitors(int page, int size, String sortBy, String sortDirection) {
    Page<TrustedVisitor> result = trustedVisitorRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(visitorMapper::toTrustedVisitorResponse), sortBy, sortDirection);
  }

  @Override
  public ServiceProviderResponse createServiceProvider(ServiceProviderRequest request, String username, String ipAddress) {
    Society society = findSociety(request.getSocietyId());
    if (serviceProviderRepository.findBySocietyIdAndContactPhoneAndDeletedFalse(society.getId(), request.getContactPhone().trim()).isPresent()) {
      throw new BadRequestException("Service provider already exists for this society");
    }
    ServiceProvider provider = new ServiceProvider();
    provider.setSociety(society);
    provider.setProviderName(request.getProviderName().trim());
    provider.setServiceType(request.getServiceType().trim());
    provider.setContactPhone(request.getContactPhone().trim());
    provider.setContactEmail(request.getContactEmail() == null ? null : request.getContactEmail().trim());
    provider.setNotes(request.getNotes() == null ? null : request.getNotes().trim());
    provider.setCreatedBy(username);
    provider.setUpdatedBy(username);
    ServiceProvider saved = serviceProviderRepository.save(provider);

    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "ServiceProvider", saved.getId().toString(), "SUCCESS", "Service provider created"));
    return visitorMapper.toServiceProviderResponse(saved);
  }

  @Override
  public void deleteServiceProvider(Long serviceProviderId, String username, String ipAddress) {
    ServiceProvider provider = getServiceProvider(serviceProviderId);
    provider.setDeleted(true);
    provider.setActive(false);
    provider.setUpdatedBy(username);
    serviceProviderRepository.save(provider);
    domainAuditService.log(buildEvent(username, ipAddress, "DELETE", "ServiceProvider", serviceProviderId.toString(), "SUCCESS", "Service provider soft deleted"));
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ServiceProviderResponse> listServiceProviders(int page, int size, String sortBy, String sortDirection) {
    Page<ServiceProvider> result = serviceProviderRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(visitorMapper::toServiceProviderResponse), sortBy, sortDirection);
  }

  private Resident findResident(Long residentId, String username) {
    if (residentId != null) {
      java.util.Optional<Resident> res = residentRepository.findById(residentId).filter(r -> !r.isDeleted());
      if (res.isPresent()) return res.get();
    }
    if (username != null && !username.isBlank()) {
      java.util.Optional<Resident> res = residentRepository.findByUserUsernameIgnoreCaseAndDeletedFalse(username);
      if (res.isPresent()) return res.get();
    }
    return residentRepository.findAll().stream()
        .filter(r -> !r.isDeleted())
        .findFirst()
        .orElseThrow(() -> new ResourceNotFoundException("Resident not found"));
  }

  private Resident findResident(Long residentId) {
    return findResident(residentId, null);
  }

  private Society findSociety(Long societyId) {
    return societyRepository.findById(societyId)
        .filter(society -> !society.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Society not found"));
  }

  private VisitorInvitation getInvitation(Long invitationId) {
    return invitationRepository.findById(invitationId)
        .filter(invitation -> !invitation.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Visitor invitation not found"));
  }

  private TrustedVisitor getTrustedVisitor(Long trustedVisitorId) {
    return trustedVisitorRepository.findById(trustedVisitorId)
        .filter(visitor -> !visitor.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Trusted visitor not found"));
  }

  private ServiceProvider getServiceProvider(Long serviceProviderId) {
    return serviceProviderRepository.findById(serviceProviderId)
        .filter(provider -> !provider.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Service provider not found"));
  }

  private DomainAuditEvent buildEvent(String username, String ipAddress, String action, String entityName, String entityId, String result, String detail) {
    return DomainAuditEvent.builder()
        .timestamp(DateUtil.nowUtc())
        .username(username)
        .role("SECURITY_GUARD")
        .ipAddress(ipAddress)
        .action(action)
        .entityName(entityName)
        .entityId(entityId)
        .result(result)
        .detail(detail)
        .build();
  }

  @Override
  @Transactional
  public com.ssasm.response.visitor.GateScanResult scanGateToken(String token, String username, String ipAddress) {
    if (token == null || token.isBlank()) {
      return com.ssasm.response.visitor.GateScanResult.builder()
          .passType("UNKNOWN")
          .valid(false)
          .allowEntry(false)
          .statusMessage("Please enter or scan a valid token.")
          .build();
    }

    String clean = token.trim();

    // 1. Check Permanent Residents by Token, Flat Number, or Username
    var allResidents = residentRepository.findByDeletedFalse();
    for (Resident r : allResidents) {
      String residentToken = com.ssasm.mapper.society.ResidentMapper.computeGatePassToken(r);
      String flatNum = (r.getFlat() != null && r.getFlat().getFlatNumber() != null) ? r.getFlat().getFlatNumber().trim() : "";
      String rUsername = (r.getUser() != null && r.getUser().getUsername() != null) ? r.getUser().getUsername().trim() : "";

      if (residentToken.equalsIgnoreCase(clean)
          || (!flatNum.isEmpty() && flatNum.equalsIgnoreCase(clean))
          || (!rUsername.isEmpty() && rUsername.equalsIgnoreCase(clean))
          || r.getFullName().equalsIgnoreCase(clean)) {

        if (!"ACTIVE".equalsIgnoreCase(r.getResidentStatus())) {
          return com.ssasm.response.visitor.GateScanResult.builder()
              .passType("RESIDENT")
              .valid(false)
              .allowEntry(false)
              .gatePassToken(residentToken)
              .personName(r.getFullName())
              .flatNumber(flatNum)
              .buildingName(r.getFlat() != null && r.getFlat().getBuilding() != null ? r.getFlat().getBuilding().getBuildingName() : "")
              .residentStatus(r.getResidentStatus())
              .statusMessage("INACTIVE RESIDENT: Gate pass is deactivated (" + r.getResidentStatus() + ").")
              .build();
        }

        domainAuditService.log(buildEvent(username, ipAddress, "VERIFY_RESIDENT", "Resident", r.getId().toString(), "SUCCESS", "Permanent resident gate pass verified"));

        return com.ssasm.response.visitor.GateScanResult.builder()
            .passType("RESIDENT")
            .valid(true)
            .allowEntry(true)
            .gatePassToken(residentToken)
            .residentId(r.getId())
            .personName(r.getFullName())
            .phoneNumber(r.getPhoneNumber())
            .flatNumber(flatNum)
            .buildingName(r.getFlat() != null && r.getFlat().getBuilding() != null ? r.getFlat().getBuilding().getBuildingName() : "")
            .occupancyType(r.getOccupancyType() != null ? r.getOccupancyType() : "OWNER")
            .residentStatus("ACTIVE")
            .statusMessage("VERIFIED PERMANENT RESIDENT: Flat " + flatNum + " (" + (r.getFlat() != null && r.getFlat().getBuilding() != null ? r.getFlat().getBuilding().getBuildingName() : "") + ") - Full Gate Clearance Granted.")
            .build();
      }
    }

    // 2. Check Visitor Invitations / Guest Passes
    var visitorOpt = invitationRepository.findByQrCodeTokenAndDeletedFalse(clean);
    if (visitorOpt.isPresent()) {
      VisitorInvitation inv = visitorOpt.get();
      Resident host = inv.getResident();
      String flatNo = (host != null && host.getFlat() != null) ? host.getFlat().getFlatNumber() : "N/A";
      String bldName = (host != null && host.getFlat() != null && host.getFlat().getBuilding() != null) ? host.getFlat().getBuilding().getBuildingName() : "";
      String hostName = host != null ? host.getFullName() : "Flat Owner";

      boolean allow = (inv.getPassStatus() == VisitorPassStatus.APPROVED || inv.getPassStatus() == VisitorPassStatus.ACTIVE);
      String msg;
      if (inv.getPassStatus() == VisitorPassStatus.APPROVED) {
        msg = "APPROVED BY FLAT OWNER: Resident " + hostName + " (Flat " + flatNo + ") approved this visitor pass. Gate entry barrier authorized.";
      } else if (inv.getPassStatus() == VisitorPassStatus.PENDING) {
        msg = "PENDING APPROVAL: Resident " + hostName + " (Flat " + flatNo + ") has NOT approved yet. Entry restricted until resident confirms.";
      } else if (inv.getPassStatus() == VisitorPassStatus.REJECTED) {
        msg = "ENTRY DENIED: Flat owner " + hostName + " rejected this visitor entry request. Do not allow entrance.";
      } else if (inv.getPassStatus() == VisitorPassStatus.ACTIVE) {
        msg = "VISITOR ALREADY INSIDE: Currently active inside society. Ready for gate exit logging.";
      } else {
        msg = "PASS INACTIVE: Status is " + inv.getPassStatus() + ".";
      }

      return com.ssasm.response.visitor.GateScanResult.builder()
          .passType("VISITOR")
          .valid(inv.getPassStatus() != VisitorPassStatus.REJECTED && inv.getPassStatus() != VisitorPassStatus.EXPIRED)
          .allowEntry(allow)
          .gatePassToken(inv.getQrCodeToken())
          .invitationId(inv.getId())
          .residentId(host != null ? host.getId() : null)
          .personName(inv.getVisitorName())
          .phoneNumber(inv.getVisitorPhone())
          .flatNumber(flatNo)
          .buildingName(bldName)
          .purpose(inv.getPurpose())
          .passStatus(inv.getPassStatus().name())
          .statusMessage(msg)
          .entryTime(inv.getEntryTime() != null ? inv.getEntryTime().toString() : null)
          .exitTime(inv.getExitTime() != null ? inv.getExitTime().toString() : null)
          .build();
    }

    // 3. Fallback: Unknown or Unauthorized Token
    return com.ssasm.response.visitor.GateScanResult.builder()
        .passType("UNKNOWN")
        .valid(false)
        .allowEntry(false)
        .gatePassToken(clean)
        .statusMessage("UNAUTHORIZED TOKEN: No matching permanent resident or approved visitor pass found for '" + clean + "'. Entry denied.")
        .build();
  }

  @Override
  public VisitorInvitationResponse createQuickPass(com.ssasm.dto.visitor.QuickGatePassRequest request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId());

    VisitorInvitation invitation = new VisitorInvitation();
    invitation.setResident(resident);
    invitation.setVisitorName(request.getVisitorName().trim());
    invitation.setVisitorPhone(request.getVisitorPhone().trim());
    invitation.setVisitorCompany(request.getVisitorCompany() != null ? request.getVisitorCompany().trim() : "Guest / Visitor");
    invitation.setPurpose(request.getPurpose() != null ? request.getPurpose().trim() : "Friends & Family Visit");
    invitation.setExpectedArrival(LocalDateTime.now());
    
    // Auto-generate unique gate token format: VIS-PASS-XXXXXX
    String token = "VIS-PASS-" + (100000 + (int)(Math.random() * 900000));
    invitation.setQrCodeToken(token);

    if (Boolean.TRUE.equals(request.getIsPreApproved())) {
      invitation.setPassStatus(VisitorPassStatus.APPROVED);
      invitation.setApprovedAt(LocalDateTime.now());
    } else {
      invitation.setPassStatus(VisitorPassStatus.PENDING);
    }

    invitation.setCreatedBy(username);
    invitation.setUpdatedBy(username);
    VisitorInvitation saved = invitationRepository.save(invitation);

    domainAuditService.log(buildEvent(username, ipAddress, "CREATE_GATE_PASS", "VisitorInvitation", saved.getId().toString(), "SUCCESS", "Quick gate pass issued: " + token));
    return visitorMapper.toInvitationResponse(saved);
  }

  @Override
  public com.ssasm.response.visitor.GateScanResult logResidentMovement(Long residentId, String direction, String username, String ipAddress) {
    Resident resident = findResident(residentId, username);
    String flatNo = (resident.getFlat() != null && resident.getFlat().getFlatNumber() != null) ? resident.getFlat().getFlatNumber() : "101";
    String bldName = (resident.getFlat() != null && resident.getFlat().getBuilding() != null) ? resident.getFlat().getBuilding().getBuildingName() : "Main Building";
    String actionDesc = "Resident " + resident.getFullName() + " (Flat " + flatNo + ") " + direction + " logged at Main Security Gate";
    
    domainAuditService.log(buildEvent(username, ipAddress, "RESIDENT_" + direction.toUpperCase(), "Resident", resident.getId().toString(), "SUCCESS", actionDesc));

    String residentToken = com.ssasm.mapper.society.ResidentMapper.computeGatePassToken(resident);
    boolean isEntry = "ENTRY".equalsIgnoreCase(direction);
    String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

    return com.ssasm.response.visitor.GateScanResult.builder()
        .passType("RESIDENT")
        .valid(true)
        .allowEntry(isEntry)
        .gatePassToken(residentToken)
        .residentId(resident.getId())
        .personName(resident.getFullName())
        .phoneNumber(resident.getPhoneNumber())
        .flatNumber(flatNo)
        .buildingName(bldName)
        .occupancyType(resident.getOccupancyType() != null ? resident.getOccupancyType() : "OWNER")
        .residentStatus("ACTIVE")
        .statusMessage(actionDesc + " [GATE BARRIER " + (isEntry ? "OPENED 🟢" : "LOGGED 🚙") + "]")
        .entryTime(isEntry ? timestamp : null)
        .exitTime(!isEntry ? timestamp : null)
        .build();
  }
}
