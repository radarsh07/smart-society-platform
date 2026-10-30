package com.ssasm.controller.community;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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
import com.ssasm.response.ApiResponse;
import com.ssasm.response.PageResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.security.annotation.SocietyAdminOnly;
import com.ssasm.security.annotation.SocietyStaffOnly;
import com.ssasm.service.community.CommunityService;
import com.ssasm.util.ResponseUtil;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

  private final CommunityService communityService;

  public CommunityController(CommunityService communityService) {
    this.communityService = communityService;
  }

  @PostMapping("/complaints")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF')")
  public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
      @Valid @RequestBody ComplaintRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ComplaintResponse response = communityService.createComplaint(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Complaint created successfully", response));
  }

  @PutMapping("/complaints/{id}/assign")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<ComplaintResponse>> assignComplaint(
      @PathVariable Long id,
      @RequestParam(required = false) Long staffId,
      @RequestParam(required = false) com.ssasm.enums.ComplaintPriority priority,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ComplaintResponse response = communityService.assignComplaint(id, staffId, priority, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Complaint assigned successfully", response));
  }

  @PutMapping("/complaints/{id}/status")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_SOCIETY_STAFF')")
  public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
      @PathVariable Long id,
      @RequestParam com.ssasm.enums.ComplaintStatus status,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ComplaintResponse response = communityService.updateComplaintStatus(id, status, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Complaint status updated successfully", response));
  }

  @GetMapping("/complaints")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF')")
  public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> listComplaints(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Complaints fetched successfully", communityService.listComplaints(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/staff")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<StaffResponse>> createStaff(
      @Valid @RequestBody StaffResponse request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    StaffResponse response = communityService.createStaff(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Staff created successfully", response));
  }

  @PutMapping("/staff/{id}/status")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_SOCIETY_STAFF')")
  public ResponseEntity<ApiResponse<StaffResponse>> updateStaffStatus(
      @PathVariable Long id,
      @RequestParam String workStatus,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    StaffResponse response = communityService.updateStaffStatus(id, workStatus, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Staff work status updated successfully", response));
  }

  @GetMapping("/staff")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_SOCIETY_STAFF', 'ROLE_RESIDENT')")
  public ResponseEntity<ApiResponse<PageResponse<StaffResponse>>> listStaff(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Staff fetched successfully", communityService.listStaff(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/maintenance-bills/{residentId}")
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<MaintenanceBillResponse>> createMaintenanceBill(
      @PathVariable Long residentId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    MaintenanceBillResponse response = communityService.createMaintenanceBill(residentId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Maintenance bill created successfully", response));
  }

  @GetMapping("/maintenance-bills")
  public ResponseEntity<ApiResponse<PageResponse<MaintenanceBillResponse>>> listMaintenanceBills(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Maintenance bills fetched successfully", communityService.listMaintenanceBills(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/payments")
  public ResponseEntity<ApiResponse<com.ssasm.dto.community.PaymentResponse>> processPayment(
      @Valid @RequestBody com.ssasm.dto.community.PaymentRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    com.ssasm.dto.community.PaymentResponse response = communityService.processPayment(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Payment processed successfully", response));
  }

  @PostMapping("/vehicles")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(
      @Valid @RequestBody VehicleRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    VehicleResponse response = communityService.createVehicle(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Vehicle created successfully", response));
  }

  @GetMapping("/vehicles")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<VehicleResponse>>> listVehicles(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Vehicles fetched successfully", communityService.listVehicles(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/parking/allocate/{residentId}/{vehicleId}")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<ParkingAllocationResponse>> allocateParking(
      @PathVariable Long residentId,
      @PathVariable Long vehicleId,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ParkingAllocationResponse response = communityService.allocateParking(residentId, vehicleId, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Parking allocated successfully", response));
  }

  @GetMapping("/parking")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<ParkingAllocationResponse>>> listParkingAllocations(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Parking allocations fetched successfully", communityService.listParkingAllocations(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/facility-bookings")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<FacilityBookingResponse>> createFacilityBooking(
      @Valid @RequestBody FacilityBookingRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    FacilityBookingResponse response = communityService.createFacilityBooking(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Facility booking created successfully", response));
  }

  @GetMapping("/facility-bookings")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<FacilityBookingResponse>>> listFacilityBookings(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Facility bookings fetched successfully", communityService.listFacilityBookings(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/marketplace")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<MarketplaceItemResponse>> createMarketplaceItem(
      @Valid @RequestBody MarketplaceItemRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    MarketplaceItemResponse response = communityService.createMarketplaceItem(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Marketplace item created successfully", response));
  }

  @GetMapping("/marketplace")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<MarketplaceItemResponse>>> listMarketplaceItems(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Marketplace items fetched successfully", communityService.listMarketplaceItems(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/to-let")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<ToLetListingResponse>> createToLetListing(
      @Valid @RequestBody ToLetListingRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ToLetListingResponse response = communityService.createToLetListing(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("To-let listing created successfully", response));
  }

  @GetMapping("/to-let")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<ToLetListingResponse>>> listToLetListings(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("To-let listings fetched successfully", communityService.listToLetListings(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/service-bookings")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<ServiceBookingResponse>> createServiceBooking(
      @Valid @RequestBody ServiceBookingRequest request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ServiceBookingResponse response = communityService.createServiceBooking(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Service booking created successfully", response));
  }

  @GetMapping("/service-bookings")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<ServiceBookingResponse>>> listServiceBookings(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Service bookings fetched successfully", communityService.listServiceBookings(page, size, sortBy, sortDirection)));
  }

  @PostMapping("/parcels")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<ParcelResponse>> createParcel(
      @Valid @RequestBody ParcelResponse request,
      @AuthenticationPrincipal UserPrincipal principal,
      HttpServletRequest httpServletRequest) {
    ParcelResponse response = communityService.createParcel(request, principal.getUsername(), httpServletRequest.getRemoteAddr());
    return ResponseEntity.ok(ResponseUtil.success("Parcel recorded successfully", response));
  }

  @GetMapping("/parcels")
  @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_SOCIETY_ADMIN', 'ROLE_RESIDENT', 'ROLE_SOCIETY_STAFF', 'ROLE_SECURITY_GUARD')")
  public ResponseEntity<ApiResponse<PageResponse<ParcelResponse>>> listParcels(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "DESC") String sortDirection) {
    return ResponseEntity.ok(ResponseUtil.success("Parcels fetched successfully", communityService.listParcels(page, size, sortBy, sortDirection)));
  }
}
