package com.ssasm.service.community;

import com.ssasm.dto.community.ComplaintRequest;
import com.ssasm.dto.community.ComplaintResponse;
import com.ssasm.dto.community.FacilityBookingRequest;
import com.ssasm.dto.community.FacilityBookingResponse;
import com.ssasm.dto.community.GenerateSocietyBillsRequest;
import com.ssasm.dto.community.MaintenanceBillResponse;
import com.ssasm.dto.community.MarketplaceItemRequest;
import com.ssasm.dto.community.MarketplaceItemResponse;
import com.ssasm.dto.community.ParcelResponse;
import com.ssasm.dto.community.ParkingAllocationResponse;
import com.ssasm.dto.community.PaymentResponse;
import com.ssasm.dto.community.ServiceBookingRequest;
import com.ssasm.dto.community.ServiceBookingResponse;
import com.ssasm.dto.community.StaffResponse;
import com.ssasm.dto.community.ToLetListingRequest;
import com.ssasm.dto.community.ToLetListingResponse;
import com.ssasm.dto.community.VehicleRequest;
import com.ssasm.dto.community.VehicleResponse;
import com.ssasm.response.PageResponse;

public interface CommunityService {

  ComplaintResponse createComplaint(ComplaintRequest request, String username, String ipAddress);

  ComplaintResponse assignComplaint(Long complaintId, Long staffId, com.ssasm.enums.ComplaintPriority priority, String username, String ipAddress);

  ComplaintResponse updateComplaintStatus(Long complaintId, com.ssasm.enums.ComplaintStatus status, String username, String ipAddress);

  PageResponse<ComplaintResponse> listComplaints(int page, int size, String sortBy, String sortDirection);

  StaffResponse createStaff(StaffResponse request, String username, String ipAddress);

  StaffResponse updateStaffStatus(Long staffId, String workStatus, String username, String ipAddress);

  PageResponse<StaffResponse> listStaff(int page, int size, String sortBy, String sortDirection);

  MaintenanceBillResponse createMaintenanceBill(Long residentId, String username, String ipAddress);

  java.util.List<MaintenanceBillResponse> generateBillsForAllResidents(GenerateSocietyBillsRequest request, String username, String ipAddress);

  void deleteBill(Long billId, String username, String ipAddress);

  void clearAllBills(String username, String ipAddress);

  PageResponse<MaintenanceBillResponse> listMaintenanceBills(int page, int size, String sortBy, String sortDirection, String username, String role);

  PageResponse<PaymentResponse> listPayments(int page, int size, String sortBy, String sortDirection, String username, String role);

  VehicleResponse createVehicle(VehicleRequest request, String username, String ipAddress);

  PageResponse<VehicleResponse> listVehicles(int page, int size, String sortBy, String sortDirection);

  ParkingAllocationResponse allocateParking(Long residentId, Long vehicleId, String username, String ipAddress);

  PageResponse<ParkingAllocationResponse> listParkingAllocations(int page, int size, String sortBy, String sortDirection);

  FacilityBookingResponse createFacilityBooking(FacilityBookingRequest request, String username, String ipAddress);

  PageResponse<FacilityBookingResponse> listFacilityBookings(int page, int size, String sortBy, String sortDirection);

  MarketplaceItemResponse createMarketplaceItem(MarketplaceItemRequest request, String username, String ipAddress);

  PageResponse<MarketplaceItemResponse> listMarketplaceItems(int page, int size, String sortBy, String sortDirection);

  ToLetListingResponse createToLetListing(ToLetListingRequest request, String username, String ipAddress);

  PageResponse<ToLetListingResponse> listToLetListings(int page, int size, String sortBy, String sortDirection);

  ServiceBookingResponse createServiceBooking(ServiceBookingRequest request, String username, String ipAddress);

  PageResponse<ServiceBookingResponse> listServiceBookings(int page, int size, String sortBy, String sortDirection);

  ParcelResponse createParcel(ParcelResponse request, String username, String ipAddress);

  PageResponse<ParcelResponse> listParcels(int page, int size, String sortBy, String sortDirection);

  PaymentResponse processPayment(com.ssasm.dto.community.PaymentRequest request, String username, String ipAddress);
}
