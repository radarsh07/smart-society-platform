package com.ssasm.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.audit.DomainAuditEvent;
import com.ssasm.audit.DomainAuditService;
import com.ssasm.dto.community.ComplaintRequest;
import com.ssasm.dto.community.ComplaintResponse;
import com.ssasm.dto.community.FacilityBookingRequest;
import com.ssasm.dto.community.FacilityBookingResponse;
import com.ssasm.dto.community.MaintenanceBillResponse;
import com.ssasm.dto.community.MarketplaceItemRequest;
import com.ssasm.dto.community.MarketplaceItemResponse;
import com.ssasm.dto.community.ParcelResponse;
import com.ssasm.dto.community.ParkingAllocationResponse;
import com.ssasm.dto.community.ServiceBookingRequest;
import com.ssasm.dto.community.ServiceBookingResponse;
import com.ssasm.dto.community.StaffResponse;
import com.ssasm.dto.community.ToLetListingRequest;
import com.ssasm.dto.community.ToLetListingResponse;
import com.ssasm.dto.community.VehicleRequest;
import com.ssasm.dto.community.VehicleResponse;
import com.ssasm.entity.community.Complaint;
import com.ssasm.entity.community.ComplaintCategory;
import com.ssasm.entity.community.Facility;
import com.ssasm.entity.community.FacilityBooking;
import com.ssasm.entity.community.MaintenanceBill;
import com.ssasm.entity.community.MarketplaceItem;
import com.ssasm.entity.community.Parcel;
import com.ssasm.entity.community.ParkingAllocation;
import com.ssasm.entity.community.ParkingSlot;
import com.ssasm.entity.community.ServiceBooking;
import com.ssasm.entity.community.Staff;
import com.ssasm.entity.community.ToLetListing;
import com.ssasm.entity.community.Vehicle;
import com.ssasm.entity.society.Resident;
import com.ssasm.exception.BadRequestException;
import com.ssasm.exception.ResourceNotFoundException;
import com.ssasm.mapper.community.CommunityMapper;
import com.ssasm.repository.community.ComplaintCategoryRepository;
import com.ssasm.repository.community.ComplaintRepository;
import com.ssasm.repository.community.FacilityBookingRepository;
import com.ssasm.repository.community.FacilityRepository;
import com.ssasm.repository.community.MaintenanceBillRepository;
import com.ssasm.repository.community.MarketplaceItemRepository;
import com.ssasm.repository.community.ParcelRepository;
import com.ssasm.repository.community.ParkingAllocationRepository;
import com.ssasm.repository.community.ParkingSlotRepository;
import com.ssasm.repository.community.ServiceBookingRepository;
import com.ssasm.repository.community.StaffRepository;
import com.ssasm.repository.community.ToLetListingRepository;
import com.ssasm.repository.community.VehicleRepository;
import com.ssasm.repository.society.ResidentRepository;
import com.ssasm.response.PageResponse;
import com.ssasm.service.community.CommunityService;
import com.ssasm.util.DateUtil;
import com.ssasm.util.PageResponseUtil;

@Service
@Transactional
public class CommunityServiceImpl implements CommunityService {

  private final ComplaintRepository complaintRepository;
  private final ComplaintCategoryRepository complaintCategoryRepository;
  private final StaffRepository staffRepository;
  private final MaintenanceBillRepository maintenanceBillRepository;
  private final VehicleRepository vehicleRepository;
  private final ParkingSlotRepository parkingSlotRepository;
  private final ParkingAllocationRepository parkingAllocationRepository;
  private final FacilityBookingRepository facilityBookingRepository;
  private final FacilityRepository facilityRepository;
  private final MarketplaceItemRepository marketplaceItemRepository;
  private final ToLetListingRepository toLetListingRepository;
  private final ServiceBookingRepository serviceBookingRepository;
  private final ParcelRepository parcelRepository;
  private final ResidentRepository residentRepository;
  private final com.ssasm.repository.community.PaymentRepository paymentRepository;
  private final com.ssasm.repository.auth.UserRepository userRepository;
  private final CommunityMapper communityMapper;
  private final DomainAuditService domainAuditService;

  public CommunityServiceImpl(
      ComplaintRepository complaintRepository,
      ComplaintCategoryRepository complaintCategoryRepository,
      StaffRepository staffRepository,
      MaintenanceBillRepository maintenanceBillRepository,
      VehicleRepository vehicleRepository,
      ParkingSlotRepository parkingSlotRepository,
      ParkingAllocationRepository parkingAllocationRepository,
      FacilityBookingRepository facilityBookingRepository,
      FacilityRepository facilityRepository,
      MarketplaceItemRepository marketplaceItemRepository,
      ToLetListingRepository toLetListingRepository,
      ServiceBookingRepository serviceBookingRepository,
      ParcelRepository parcelRepository,
      ResidentRepository residentRepository,
      com.ssasm.repository.community.PaymentRepository paymentRepository,
      com.ssasm.repository.auth.UserRepository userRepository,
      CommunityMapper communityMapper,
      DomainAuditService domainAuditService) {
    this.complaintRepository = complaintRepository;
    this.complaintCategoryRepository = complaintCategoryRepository;
    this.staffRepository = staffRepository;
    this.maintenanceBillRepository = maintenanceBillRepository;
    this.vehicleRepository = vehicleRepository;
    this.parkingSlotRepository = parkingSlotRepository;
    this.parkingAllocationRepository = parkingAllocationRepository;
    this.facilityBookingRepository = facilityBookingRepository;
    this.facilityRepository = facilityRepository;
    this.marketplaceItemRepository = marketplaceItemRepository;
    this.toLetListingRepository = toLetListingRepository;
    this.serviceBookingRepository = serviceBookingRepository;
    this.parcelRepository = parcelRepository;
    this.residentRepository = residentRepository;
    this.paymentRepository = paymentRepository;
    this.userRepository = userRepository;
    this.communityMapper = communityMapper;
    this.domainAuditService = domainAuditService;
  }

  @Override
  public ComplaintResponse createComplaint(ComplaintRequest request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId(), username);
    ComplaintCategory category = null;
    if (request.getCategoryId() != null) {
      category = complaintCategoryRepository.findByIdAndDeletedFalse(request.getCategoryId()).orElse(null);
    }
    if (category == null) {
      category = complaintCategoryRepository.findAll().stream().filter(c -> !c.isDeleted()).findFirst()
          .orElseGet(() -> {
            ComplaintCategory def = new ComplaintCategory();
            def.setName("General Maintenance");
            def.setDescription("Default maintenance category");
            def.setCreatedBy("SYSTEM");
            def.setUpdatedBy("SYSTEM");
            return complaintCategoryRepository.save(def);
          });
    }
    Complaint complaint = new Complaint();
    complaint.setResident(resident);
    complaint.setCategory(category);
    complaint.setSubject(request.getSubject().trim());
    complaint.setDescription(request.getDescription().trim());
    // Auto-detect priority intelligently based on keywords (fire, water leak, gas, electrical hazard, etc.)
    com.ssasm.enums.ComplaintPriority determinedPriority = determineAutoPriority(
        category != null ? category.getName() : null,
        request.getSubject(),
        request.getDescription(),
        request.getPriority()
    );
    complaint.setPriority(determinedPriority);
    complaint.setTicketNumber("CMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    complaint.setImageUrls(request.getImageUrls());
    complaint.setCreatedBy(username);
    complaint.setUpdatedBy(username);
    autoAssignStaffIfAvailable(complaint, category, request.getSubject(), request.getDescription());
    Complaint saved = complaintRepository.save(complaint);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "Complaint", saved.getId().toString(), "SUCCESS", "Complaint created"));
    return communityMapper.toComplaintResponse(saved);
  }

  @Override
  public ComplaintResponse assignComplaint(Long complaintId, Long staffId, com.ssasm.enums.ComplaintPriority priority, String username, String ipAddress) {
    Complaint complaint = complaintRepository.findById(complaintId)
        .filter(c -> !c.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
    if (staffId == null || staffId <= 0) {
      complaint.setAssignedStaff(null);
      complaint.setAssignedAt(null);
      complaint.setStatus(com.ssasm.enums.ComplaintStatus.OPEN);
    } else {
      Staff staff = staffRepository.findById(staffId).orElse(null);
      if (staff != null && staff.getUser() != null) {
        complaint.setAssignedStaff(staff.getUser());
      } else if (staff != null) {
        com.ssasm.entity.auth.User staffUser = userRepository.findByEmailIgnoreCase(staff.getEmail())
            .orElseGet(() -> userRepository.findByUsernameIgnoreCase("staff").orElse(null));
        complaint.setAssignedStaff(staffUser);
      } else {
        userRepository.findById(staffId).ifPresent(complaint::setAssignedStaff);
      }
      complaint.setAssignedAt(LocalDateTime.now());
      complaint.setStatus(com.ssasm.enums.ComplaintStatus.IN_PROGRESS);
    }
    if (priority != null) {
      complaint.setPriority(priority);
    }
    complaint.setUpdatedBy(username);
    Complaint saved = complaintRepository.save(complaint);
    domainAuditService.log(buildEvent(username, ipAddress, "ASSIGN", "Complaint", saved.getId().toString(), "SUCCESS", "Complaint assigned"));
    return communityMapper.toComplaintResponse(saved);
  }

  @Override
  public ComplaintResponse updateComplaintStatus(Long complaintId, com.ssasm.enums.ComplaintStatus status, String username, String ipAddress) {
    Complaint complaint = complaintRepository.findById(complaintId)
        .filter(c -> !c.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
    complaint.setStatus(status);
    if (status == com.ssasm.enums.ComplaintStatus.RESOLVED) {
      complaint.setResolvedAt(LocalDateTime.now());
    } else if (status == com.ssasm.enums.ComplaintStatus.CLOSED) {
      complaint.setClosedAt(LocalDateTime.now());
    }
    complaint.setUpdatedBy(username);
    Complaint saved = complaintRepository.save(complaint);
    domainAuditService.log(buildEvent(username, ipAddress, "UPDATE_STATUS", "Complaint", saved.getId().toString(), "SUCCESS", "Complaint status updated to " + status));
    return communityMapper.toComplaintResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ComplaintResponse> listComplaints(int page, int size, String sortBy, String sortDirection) {
    Page<Complaint> result = complaintRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(communityMapper::toComplaintResponse), sortBy, sortDirection);
  }

  @Override
  public StaffResponse createStaff(StaffResponse request, String username, String ipAddress) {
    Staff staff = new Staff();
    staff.setFullName(request.getFullName());
    staff.setSpecialization(request.getSpecialization());
    staff.setPhoneNumber(request.getPhoneNumber());
    staff.setEmail(request.getEmail());
    staff.setWorkStatus(request.getWorkStatus());
    staff.setCreatedBy(username);
    staff.setUpdatedBy(username);
    Staff saved = staffRepository.save(staff);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "Staff", saved.getId().toString(), "SUCCESS", "Staff created"));
    return communityMapper.toStaffResponse(saved);
  }

  @Override
  public StaffResponse updateStaffStatus(Long staffId, String workStatus, String username, String ipAddress) {
    Staff staff = staffRepository.findById(staffId)
        .filter(s -> !s.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));
    staff.setWorkStatus(workStatus != null ? workStatus.toUpperCase().trim() : "AVAILABLE");
    staff.setUpdatedBy(username);
    Staff saved = staffRepository.save(staff);
    domainAuditService.log(buildEvent(username, ipAddress, "UPDATE_STATUS", "Staff", saved.getId().toString(), "SUCCESS", "Staff work status updated to " + workStatus));
    return communityMapper.toStaffResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<StaffResponse> listStaff(int page, int size, String sortBy, String sortDirection) {
    Page<Staff> result = staffRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(communityMapper::toStaffResponse), sortBy, sortDirection);
  }

  @Override
  public java.util.List<MaintenanceBillResponse> generateBillsForAllResidents(
      com.ssasm.dto.community.GenerateSocietyBillsRequest request, String username, String ipAddress) {
    java.util.List<Resident> residents = residentRepository.findByDeletedFalse();
    if (residents.isEmpty()) {
      throw new BadRequestException("No registered residents found in society to generate bills for.");
    }

    String billTypeName = request.getBillType() != null && !request.getBillType().isBlank()
        ? request.getBillType().trim()
        : "Monthly Society Maintenance";
    java.math.BigDecimal amount = request.getAmount() != null
        ? request.getAmount()
        : new java.math.BigDecimal("2500.00");
    java.time.LocalDate dueDate = request.getDueDate() != null
        ? request.getDueDate()
        : java.time.LocalDate.now().plusDays(15);

    java.util.List<MaintenanceBillResponse> generatedList = new java.util.ArrayList<>();

    for (Resident res : residents) {
      MaintenanceBill bill = new MaintenanceBill();
      bill.setResident(res);
      bill.setBillNumber("MB-" + System.currentTimeMillis() % 1000000 + "-" + res.getId());
      bill.setBillingMonth(java.time.LocalDate.now());
      bill.setDueDate(dueDate);
      bill.setTotalAmount(amount);
      bill.setOutstandingAmount(amount);
      bill.setPaidAmount(java.math.BigDecimal.ZERO);
      bill.setStatus("PENDING");
      bill.setCreatedBy(username);
      bill.setUpdatedBy(username);

      // Create item detail with custom bill type name
      com.ssasm.entity.community.BillItem item = new com.ssasm.entity.community.BillItem();
      item.setBill(bill);
      item.setName(billTypeName);
      item.setDescription(request.getDescription() != null && !request.getDescription().isBlank()
          ? request.getDescription().trim()
          : "Society charges: " + billTypeName);
      item.setAmount(amount);
      item.setCreatedBy(username);
      item.setUpdatedBy(username);
      bill.getItems().add(item);

      MaintenanceBill saved = maintenanceBillRepository.save(bill);
      generatedList.add(communityMapper.toMaintenanceBillResponse(saved));
    }

    domainAuditService.log(buildEvent(username, ipAddress, "GENERATE_BILLS", "MaintenanceBill",
        "ALL_" + residents.size(), "SUCCESS", "Generated " + billTypeName + " bills for " + residents.size() + " residents"));

    return generatedList;
  }

  @Override
  public MaintenanceBillResponse createMaintenanceBill(Long residentId, String username, String ipAddress) {
    Resident resident = findResident(residentId);
    MaintenanceBill bill = new MaintenanceBill();
    bill.setResident(resident);
    bill.setBillNumber("MB-" + System.currentTimeMillis());
    bill.setBillingMonth(LocalDateTime.now().toLocalDate());
    bill.setDueDate(LocalDateTime.now().plusMonths(1).toLocalDate());
    bill.setTotalAmount(new java.math.BigDecimal("2500.00"));
    bill.setOutstandingAmount(new java.math.BigDecimal("2500.00"));
    bill.setPaidAmount(java.math.BigDecimal.ZERO);
    bill.setStatus("PENDING");
    bill.setCreatedBy(username);
    bill.setUpdatedBy(username);

    com.ssasm.entity.community.BillItem item = new com.ssasm.entity.community.BillItem();
    item.setBill(bill);
    item.setName("Monthly Society Maintenance");
    item.setDescription("Standard monthly society maintenance charges");
    item.setAmount(new java.math.BigDecimal("2500.00"));
    item.setCreatedBy(username);
    item.setUpdatedBy(username);
    bill.getItems().add(item);

    MaintenanceBill saved = maintenanceBillRepository.save(bill);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "MaintenanceBill", saved.getId().toString(), "SUCCESS", "Maintenance bill created"));
    return communityMapper.toMaintenanceBillResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<MaintenanceBillResponse> listMaintenanceBills(
      int page, int size, String sortBy, String sortDirection, String username, String role) {
    Page<MaintenanceBill> result;

    boolean isAdmin = role != null && (role.contains("ADMIN") || role.contains("STAFF"));
    if (isAdmin) {
      // Admins and Staff see all society bills
      result = maintenanceBillRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    } else {
      // Residents ONLY see their own bills
      Resident resident = null;
      if (username != null && !username.isBlank()) {
        resident = residentRepository.findByUserUsernameIgnoreCaseAndDeletedFalse(username).orElse(null);
      }
      if (resident != null) {
        result = maintenanceBillRepository.findByResidentIdAndDeletedFalse(
            resident.getId(), PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
      } else {
        result = Page.empty(PageRequest.of(page, size));
      }
    }
    return PageResponseUtil.fromPage(result.map(communityMapper::toMaintenanceBillResponse), sortBy, sortDirection);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<com.ssasm.dto.community.PaymentResponse> listPayments(
      int page, int size, String sortBy, String sortDirection, String username, String role) {
    Page<com.ssasm.entity.community.Payment> result;

    boolean isAdmin = role != null && (role.contains("ADMIN") || role.contains("STAFF"));
    if (isAdmin) {
      result = paymentRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    } else {
      Resident resident = null;
      if (username != null && !username.isBlank()) {
        resident = residentRepository.findByUserUsernameIgnoreCaseAndDeletedFalse(username).orElse(null);
      }
      if (resident != null) {
        result = paymentRepository.findByResidentIdAndDeletedFalse(
            resident.getId(), PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
      } else {
        result = Page.empty(PageRequest.of(page, size));
      }
    }
    return PageResponseUtil.fromPage(result.map(communityMapper::toPaymentResponse), sortBy, sortDirection);
  }

  @Override
  public VehicleResponse createVehicle(VehicleRequest request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId(), username);
    Vehicle vehicle = new Vehicle();
    vehicle.setResident(resident);
    vehicle.setVehicleNumber(request.getVehicleNumber().trim().toUpperCase());
    vehicle.setMake(request.getMake());
    vehicle.setModel(request.getModel());
    vehicle.setColor(request.getColor());
    vehicle.setCreatedBy(username);
    vehicle.setUpdatedBy(username);
    Vehicle saved = vehicleRepository.save(vehicle);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "Vehicle", saved.getId().toString(), "SUCCESS", "Vehicle created"));
    return communityMapper.toVehicleResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<VehicleResponse> listVehicles(int page, int size, String sortBy, String sortDirection) {
    Page<Vehicle> result = vehicleRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(communityMapper::toVehicleResponse), sortBy, sortDirection);
  }

  @Override
  public ParkingAllocationResponse allocateParking(Long residentId, Long vehicleId, String username, String ipAddress) {
    Resident resident = findResident(residentId, username);
    Vehicle vehicle = vehicleRepository.findById(vehicleId)
        .filter(v -> !v.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
    ParkingSlot slot = parkingSlotRepository.findFirstByDeletedFalseAndOccupiedFalseOrderByIdAsc()
        .orElseGet(() -> {
          long count = parkingSlotRepository.count();
          ParkingSlot newSlot = new ParkingSlot();
          newSlot.setSlotNumber("P-" + String.format("%02d", count + 1));
          newSlot.setSlotType("STANDARD");
          newSlot.setOccupied(false);
          newSlot.setCreatedBy("SYSTEM");
          newSlot.setUpdatedBy("SYSTEM");
          return parkingSlotRepository.save(newSlot);
        });
    ParkingAllocation allocation = new ParkingAllocation();
    allocation.setResident(resident);
    allocation.setVehicle(vehicle);
    allocation.setSlot(slot);
    allocation.setAllocatedAt(LocalDateTime.now());
    allocation.setCreatedBy(username);
    allocation.setUpdatedBy(username);
    slot.setOccupied(true);
    ParkingAllocation saved = parkingAllocationRepository.save(allocation);
    parkingSlotRepository.save(slot);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "ParkingAllocation", saved.getId().toString(), "SUCCESS", "Parking allocated"));
    return communityMapper.toParkingAllocationResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ParkingAllocationResponse> listParkingAllocations(int page, int size, String sortBy, String sortDirection) {
    Page<ParkingAllocation> result = parkingAllocationRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(communityMapper::toParkingAllocationResponse), sortBy, sortDirection);
  }

  @Override
  public FacilityBookingResponse createFacilityBooking(FacilityBookingRequest request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId(), username);
    Facility facility = null;
    if (request.getFacilityId() != null) {
      facility = facilityRepository.findById(request.getFacilityId()).filter(f -> !f.isDeleted()).orElse(null);
    }
    if (facility == null) {
      facility = facilityRepository.findAll().stream().filter(f -> !f.isDeleted()).findFirst()
          .orElseGet(() -> {
            Facility def = new Facility();
            def.setName("Clubhouse");
            def.setDescription("Air-conditioned hall with audio system & party seating.");
            def.setBookingDurationMinutes(120);
            def.setCreatedBy("SYSTEM");
            def.setUpdatedBy("SYSTEM");
            return facilityRepository.save(def);
          });
    }
    FacilityBooking booking = new FacilityBooking();
    booking.setFacility(facility);
    booking.setResident(resident);
    booking.setStartTime(request.getStartTime());
    booking.setEndTime(request.getEndTime());
    booking.setNotes(request.getNotes());
    booking.setCreatedBy(username);
    booking.setUpdatedBy(username);
    FacilityBooking saved = facilityBookingRepository.save(booking);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "FacilityBooking", saved.getId().toString(), "SUCCESS", "Facility booking created"));
    return communityMapper.toFacilityBookingResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<FacilityBookingResponse> listFacilityBookings(int page, int size, String sortBy, String sortDirection) {
    Page<FacilityBooking> result = facilityBookingRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(communityMapper::toFacilityBookingResponse), sortBy, sortDirection);
  }

  @Override
  public MarketplaceItemResponse createMarketplaceItem(MarketplaceItemRequest request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId(), username);
    MarketplaceItem item = new MarketplaceItem();
    item.setResident(resident);
    item.setTitle(request.getTitle().trim());
    item.setDescription(request.getDescription());
    item.setPrice(request.getPrice());
    item.setCategory(request.getCategory());
    item.setCreatedBy(username);
    item.setUpdatedBy(username);
    MarketplaceItem saved = marketplaceItemRepository.save(item);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "MarketplaceItem", saved.getId().toString(), "SUCCESS", "Marketplace item created"));
    return communityMapper.toMarketplaceItemResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<MarketplaceItemResponse> listMarketplaceItems(int page, int size, String sortBy, String sortDirection) {
    Page<MarketplaceItem> result = marketplaceItemRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(communityMapper::toMarketplaceItemResponse), sortBy, sortDirection);
  }

  @Override
  public ToLetListingResponse createToLetListing(ToLetListingRequest request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId(), username);
    ToLetListing listing = new ToLetListing();
    listing.setResident(resident);
    listing.setTitle(request.getTitle().trim());
    listing.setDescription(request.getDescription());
    listing.setRent(request.getRent());
    listing.setLocation(request.getLocation());
    listing.setCreatedBy(username);
    listing.setUpdatedBy(username);
    ToLetListing saved = toLetListingRepository.save(listing);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "ToLetListing", saved.getId().toString(), "SUCCESS", "To-let listing created"));
    return communityMapper.toToLetListingResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ToLetListingResponse> listToLetListings(int page, int size, String sortBy, String sortDirection) {
    Page<ToLetListing> result = toLetListingRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(communityMapper::toToLetListingResponse), sortBy, sortDirection);
  }

  @Override
  public ServiceBookingResponse createServiceBooking(ServiceBookingRequest request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId(), username);
    ServiceBooking booking = new ServiceBooking();
    booking.setResident(resident);
    booking.setServiceType(request.getServiceType().trim());
    booking.setDescription(request.getDescription());
    booking.setPreferredTime(request.getPreferredTime());
    booking.setCreatedBy(username);
    booking.setUpdatedBy(username);
    ServiceBooking saved = serviceBookingRepository.save(booking);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "ServiceBooking", saved.getId().toString(), "SUCCESS", "Service booking created"));
    return communityMapper.toServiceBookingResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ServiceBookingResponse> listServiceBookings(int page, int size, String sortBy, String sortDirection) {
    Page<ServiceBooking> result = serviceBookingRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(communityMapper::toServiceBookingResponse), sortBy, sortDirection);
  }

  @Override
  public ParcelResponse createParcel(ParcelResponse request, String username, String ipAddress) {
    Resident resident = findResident(request.getResidentId(), username);
    Parcel parcel = new Parcel();
    parcel.setResident(resident);
    parcel.setTrackingNumber(request.getTrackingNumber());
    parcel.setCourierName(request.getCourierName());
    parcel.setDescription(request.getDescription());
    parcel.setStatus(request.getStatus());
    parcel.setCreatedBy(username);
    parcel.setUpdatedBy(username);
    Parcel saved = parcelRepository.save(parcel);
    domainAuditService.log(buildEvent(username, ipAddress, "CREATE", "Parcel", saved.getId().toString(), "SUCCESS", "Parcel recorded"));
    return communityMapper.toParcelResponse(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ParcelResponse> listParcels(int page, int size, String sortBy, String sortDirection) {
    Page<Parcel> result = parcelRepository.findByDeletedFalse(PageRequest.of(page, size, PageResponseUtil.sort(sortBy, sortDirection)));
    return PageResponseUtil.fromPage(result.map(communityMapper::toParcelResponse), sortBy, sortDirection);
  }

  @Override
  public com.ssasm.dto.community.PaymentResponse processPayment(com.ssasm.dto.community.PaymentRequest request, String username, String ipAddress) {
    MaintenanceBill bill = maintenanceBillRepository.findById(request.getBillId())
        .filter(b -> !b.isDeleted())
        .orElseThrow(() -> new ResourceNotFoundException("Maintenance bill not found"));

    com.ssasm.entity.community.Payment payment = new com.ssasm.entity.community.Payment();
    payment.setBill(bill);
    payment.setResident(bill.getResident());
    payment.setAmount(request.getAmount());
    payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().name() : "RAZORPAY");
    payment.setPaymentStatus("PAID");
    payment.setTransactionId(request.getTransactionId() != null ? request.getTransactionId() : "TXN-" + System.currentTimeMillis());
    payment.setPaymentDate(LocalDateTime.now());
    payment.setCreatedBy(username);
    payment.setUpdatedBy(username);

    bill.setPaidAmount(bill.getPaidAmount().add(request.getAmount()));
    bill.setOutstandingAmount(bill.getTotalAmount().subtract(bill.getPaidAmount()));
    if (bill.getOutstandingAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
      bill.setStatus("PAID");
    } else {
      bill.setStatus("PARTIALLY_PAID");
    }
    maintenanceBillRepository.save(bill);

    com.ssasm.entity.community.Payment saved = paymentRepository.save(payment);
    domainAuditService.log(buildEvent(username, ipAddress, "PAYMENT", "Payment", saved.getId().toString(), "SUCCESS", "Payment processed successfully"));
    return communityMapper.toPaymentResponse(saved);
  }

  private Resident findResident(Long residentId, String username) {
    if (username != null && !username.isBlank() && !"admin".equalsIgnoreCase(username)) {
      java.util.Optional<Resident> res = residentRepository.findByUserUsernameIgnoreCaseAndDeletedFalse(username);
      if (res.isPresent()) {
        return res.get();
      }
    }
    if (residentId != null) {
      java.util.Optional<Resident> resident = residentRepository.findById(residentId).filter(r -> !r.isDeleted());
      if (resident.isPresent()) {
        return resident.get();
      }
    }
    if (username != null && !username.isBlank()) {
      java.util.Optional<Resident> resident = residentRepository.findByUserUsernameIgnoreCaseAndDeletedFalse(username);
      if (resident.isPresent()) {
        return resident.get();
      }
    }
    return residentRepository.findAll().stream()
        .filter(resident -> !resident.isDeleted())
        .findFirst()
        .orElseThrow(() -> new ResourceNotFoundException("Resident not found"));
  }

  private Resident findResident(Long residentId) {
    return findResident(residentId, null);
  }

  /**
   * Intelligently sets priority based on keywords in category, subject, and description.
   * Fire, smoke, gas, trapped elevator, short circuit -> URGENT
   * Water leak, pipe burst, power cut, main gate security breach -> HIGH
   * Medium / low default if not critical.
   */
  private com.ssasm.enums.ComplaintPriority determineAutoPriority(
      String categoryName,
      String subject,
      String description,
      com.ssasm.enums.ComplaintPriority requestedPriority) {

    String combined = ((categoryName != null ? categoryName : "") + " "
        + (subject != null ? subject : "") + " "
        + (description != null ? description : "")).toLowerCase();

    // 1. Extreme Critical / Life Safety -> URGENT
    if (combined.contains("fire") || combined.contains("smoke") || combined.contains("gas leak")
        || combined.contains("cylinder") || combined.contains("explosion") || combined.contains("sparking")
        || combined.contains("short circuit") || combined.contains("shock") || combined.contains("electrocution")
        || combined.contains("trapped") || combined.contains("lift trapped") || combined.contains("medical")
        || combined.contains("flood") || combined.contains("burst pipe") || combined.contains("overflow")) {
      return com.ssasm.enums.ComplaintPriority.URGENT;
    }

    // 2. High Severity -> HIGH (Water leakage, no power, lift failure, security)
    if (combined.contains("water") || combined.contains("leak") || combined.contains("seepage")
        || combined.contains("drainage") || combined.contains("sewage") || combined.contains("contamination")
        || combined.contains("no power") || combined.contains("blackout") || combined.contains("tripping")
        || combined.contains("lift stop") || combined.contains("elevator breakdown")
        || combined.contains("theft") || combined.contains("trespassing") || combined.contains("break-in")
        || combined.contains("urgent") || combined.contains("emergency")) {
      return com.ssasm.enums.ComplaintPriority.HIGH;
    }

    // 3. If user explicitly provided HIGH or URGENT, honor it
    if (requestedPriority == com.ssasm.enums.ComplaintPriority.URGENT || requestedPriority == com.ssasm.enums.ComplaintPriority.HIGH) {
      return requestedPriority;
    }

    // 4. Minor issues -> LOW
    if (combined.contains("cleaning") || combined.contains("dust") || combined.contains("sweep")
        || combined.contains("painting") || combined.contains("cosmetic") || combined.contains("bulb replacement")
        || combined.contains("garden") || combined.contains("grass") || combined.contains("noise complaint")) {
      return com.ssasm.enums.ComplaintPriority.LOW;
    }

    // 5. Default: MEDIUM
    return requestedPriority != null ? requestedPriority : com.ssasm.enums.ComplaintPriority.MEDIUM;
  }

  /**
   * Automatically assigns ticket to available staff matching category & issue specialization.
   * Strictly verifies staff is available (workStatus = AVAILABLE or ACTIVE or ON_DUTY, NOT ON_JOB / OFF_DUTY / BUSY / LEAVE).
   */
  private void autoAssignStaffIfAvailable(Complaint complaint, ComplaintCategory category, String subject, String description) {
    try {
      java.util.List<Staff> staffMembers = staffRepository.findByDeletedFalse();
      if (staffMembers == null || staffMembers.isEmpty()) {
        complaint.setStatus(com.ssasm.enums.ComplaintStatus.OPEN);
        return;
      }

      String catName = (category != null && category.getName() != null) ? category.getName().toLowerCase().trim() : "";
      String combinedText = ((subject != null ? subject : "") + " " + (description != null ? description : "")).toLowerCase().trim();

      Staff bestMatch = null;
      int bestScore = 0;

      for (Staff s : staffMembers) {
        if (s == null || s.isDeleted()) {
          continue;
        }

        // Strictly check availability
        if (!isStaffAvailable(s)) {
          continue;
        }

        int score = calculateSpecializationMatchScore(catName, combinedText, s.getSpecialization());
        if (score > bestScore) {
          bestScore = score;
          bestMatch = s;
        }
      }

      // Only assign if a domain-specific match score threshold is met (score >= 50)
      if (bestMatch != null && bestScore >= 50) {
        com.ssasm.entity.auth.User staffUser = bestMatch.getUser();
        if (staffUser == null) {
          staffUser = userRepository.findByEmailIgnoreCase(bestMatch.getEmail())
              .orElseGet(() -> userRepository.findByUsernameIgnoreCase("staff").orElse(null));
        }
        if (staffUser != null) {
          complaint.setAssignedStaff(staffUser);
          complaint.setAssignedAt(LocalDateTime.now());
          complaint.setStatus(com.ssasm.enums.ComplaintStatus.IN_PROGRESS);
          return;
        }
      }

      complaint.setStatus(com.ssasm.enums.ComplaintStatus.OPEN);
    } catch (Exception ex) {
      complaint.setStatus(com.ssasm.enums.ComplaintStatus.OPEN);
    }
  }

  private boolean isStaffAvailable(Staff staff) {
    if (staff == null || staff.isDeleted()) {
      return false;
    }
    String status = staff.getWorkStatus();
    if (status == null || status.isBlank()) {
      return true; // Default available
    }
    String s = status.trim().toUpperCase();
    // Forbidden if busy, on job, off duty, or on leave
    if (s.contains("BUSY") || s.contains("JOB") || s.contains("OFF") || s.contains("LEAVE") || s.contains("UNAVAILABLE")) {
      return false;
    }
    return s.equals("AVAILABLE") || s.equals("ACTIVE") || s.equals("ON_DUTY");
  }

  private int calculateSpecializationMatchScore(String catName, String text, String specialization) {
    if (specialization == null || specialization.isBlank()) {
      return 0; // Don't assign to unknown specialization
    }
    String spec = specialization.toLowerCase().trim();
    int score = 0;

    // Exact or direct match
    if (catName.contains(spec) || spec.contains(catName)) {
      score += 100;
    }

    // Electrical matching: if complaint mentions electric/power/light/wire/switch/spark/fuse/geyser/fan
    boolean isElectricReq = catName.contains("electric")
        || text.contains("electric") || text.contains("power") || text.contains("light")
        || text.contains("wire") || text.contains("switch") || text.contains("fuse")
        || text.contains("spark") || text.contains("short circuit") || text.contains("fan")
        || text.contains("geyser") || text.contains("mcb") || text.contains("socket");

    boolean isElectricStaff = spec.contains("electric") || spec.contains("wire") || spec.contains("light") || spec.contains("power");

    if (isElectricReq && isElectricStaff) {
      score += 150;
    }

    // Plumbing matching: pipe, leak, water, tap, sink, flush, drain, toilet, sewage
    boolean isPlumbingReq = catName.contains("plumb")
        || text.contains("plumb") || text.contains("pipe") || text.contains("leak")
        || text.contains("tap") || text.contains("water") || text.contains("drain")
        || text.contains("sink") || text.contains("flush") || text.contains("toilet")
        || text.contains("sewage") || text.contains("seepage") || text.contains("overflow");

    boolean isPlumbingStaff = spec.contains("plumb") || spec.contains("pipe") || spec.contains("water");

    if (isPlumbingReq && isPlumbingStaff) {
      score += 150;
    }

    // Elevator / Lift
    boolean isLiftReq = catName.contains("lift") || catName.contains("elevator") || text.contains("lift") || text.contains("elevator");
    boolean isLiftStaff = spec.contains("lift") || spec.contains("elevator");
    if (isLiftReq && isLiftStaff) {
      score += 150;
    }

    // Cleanliness / Waste / Housekeeping
    boolean isCleanReq = catName.contains("clean") || catName.contains("waste") || text.contains("garbage") || text.contains("clean") || text.contains("dust") || text.contains("trash");
    boolean isCleanStaff = spec.contains("clean") || spec.contains("waste") || spec.contains("housekeep") || spec.contains("janitor");
    if (isCleanReq && isCleanStaff) {
      score += 150;
    }

    // Security / Access
    boolean isSecReq = catName.contains("security") || catName.contains("access") || text.contains("gate") || text.contains("intercom") || text.contains("guard") || text.contains("trespassing");
    boolean isSecStaff = spec.contains("security") || spec.contains("guard") || spec.contains("access");
    if (isSecReq && isSecStaff) {
      score += 150;
    }

    // General fallback
    if (spec.contains("general") || spec.contains("maintenance") || spec.contains("lead")) {
      score += 10;
    }

    return score;
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
