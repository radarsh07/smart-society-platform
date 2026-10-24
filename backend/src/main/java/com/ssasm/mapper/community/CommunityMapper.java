package com.ssasm.mapper.community;

import org.springframework.stereotype.Component;
import com.ssasm.dto.community.ComplaintResponse;
import com.ssasm.dto.community.FacilityBookingResponse;
import com.ssasm.dto.community.MaintenanceBillResponse;
import com.ssasm.dto.community.MarketplaceItemResponse;
import com.ssasm.dto.community.ParcelResponse;
import com.ssasm.dto.community.ParkingAllocationResponse;
import com.ssasm.dto.community.ServiceBookingResponse;
import com.ssasm.dto.community.StaffResponse;
import com.ssasm.dto.community.ToLetListingResponse;
import com.ssasm.dto.community.VehicleResponse;
import com.ssasm.dto.community.BillItemResponse;
import com.ssasm.entity.community.BillItem;
import com.ssasm.entity.community.Complaint;
import com.ssasm.entity.community.FacilityBooking;
import com.ssasm.entity.community.MaintenanceBill;
import com.ssasm.entity.community.MarketplaceItem;
import com.ssasm.entity.community.Parcel;
import com.ssasm.entity.community.ParkingAllocation;
import com.ssasm.entity.community.ServiceBooking;
import com.ssasm.entity.community.Staff;
import com.ssasm.entity.community.ToLetListing;
import com.ssasm.entity.community.Vehicle;

@Component
public class CommunityMapper {

  public ComplaintResponse toComplaintResponse(Complaint complaint) {
    return ComplaintResponse.builder()
        .id(complaint.getId())
        .ticketNumber(complaint.getTicketNumber())
        .residentId(complaint.getResident().getId())
        .residentName(complaint.getResident().getFullName())
        .categoryId(complaint.getCategory().getId())
        .categoryName(complaint.getCategory().getName())
        .subject(complaint.getSubject())
        .description(complaint.getDescription())
        .priority(complaint.getPriority())
        .status(complaint.getStatus())
        .assignedStaffId(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getId() : null)
        .assignedStaffName(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getFullName() : null)
        .assignedAt(complaint.getAssignedAt())
        .resolvedAt(complaint.getResolvedAt())
        .closedAt(complaint.getClosedAt())
        .feedbackRating(complaint.getFeedbackRating())
        .feedbackComment(complaint.getFeedbackComment())
        .imageUrls(complaint.getImageUrls())
        .active(complaint.isActive())
        .build();
  }

  public StaffResponse toStaffResponse(Staff staff) {
    return StaffResponse.builder()
        .id(staff.getId())
        .fullName(staff.getFullName())
        .specialization(staff.getSpecialization())
        .phoneNumber(staff.getPhoneNumber())
        .email(staff.getEmail())
        .workStatus(staff.getWorkStatus())
        .userId(staff.getUser() != null ? staff.getUser().getId() : null)
        .active(staff.isActive())
        .build();
  }

  public MaintenanceBillResponse toMaintenanceBillResponse(MaintenanceBill bill) {
    return MaintenanceBillResponse.builder()
        .id(bill.getId())
        .residentId(bill.getResident().getId())
        .residentName(bill.getResident().getFullName())
        .billNumber(bill.getBillNumber())
        .billingMonth(bill.getBillingMonth())
        .dueDate(bill.getDueDate())
        .totalAmount(bill.getTotalAmount())
        .paidAmount(bill.getPaidAmount())
        .outstandingAmount(bill.getOutstandingAmount())
        .status(bill.getStatus())
        .items(bill.getItems().stream().map(this::toBillItemResponse).toList())
        .active(bill.isActive())
        .build();
  }

  public BillItemResponse toBillItemResponse(BillItem item) {
    return BillItemResponse.builder()
        .id(item.getId())
        .name(item.getName())
        .description(item.getDescription())
        .amount(item.getAmount())
        .build();
  }

  public VehicleResponse toVehicleResponse(Vehicle vehicle) {
    return VehicleResponse.builder()
        .id(vehicle.getId())
        .residentId(vehicle.getResident().getId())
        .residentName(vehicle.getResident().getFullName())
        .vehicleNumber(vehicle.getVehicleNumber())
        .make(vehicle.getMake())
        .model(vehicle.getModel())
        .color(vehicle.getColor())
        .active(vehicle.isActive())
        .build();
  }

  public ParkingAllocationResponse toParkingAllocationResponse(ParkingAllocation allocation) {
    return ParkingAllocationResponse.builder()
        .id(allocation.getId())
        .residentId(allocation.getResident().getId())
        .residentName(allocation.getResident().getFullName())
        .slotId(allocation.getSlot().getId())
        .slotNumber(allocation.getSlot().getSlotNumber())
        .vehicleId(allocation.getVehicle() != null ? allocation.getVehicle().getId() : null)
        .vehicleNumber(allocation.getVehicle() != null ? allocation.getVehicle().getVehicleNumber() : null)
        .allocatedAt(allocation.getAllocatedAt())
        .expiresAt(allocation.getExpiresAt())
        .active(allocation.isActive())
        .build();
  }

  public FacilityBookingResponse toFacilityBookingResponse(FacilityBooking booking) {
    return FacilityBookingResponse.builder()
        .id(booking.getId())
        .facilityId(booking.getFacility().getId())
        .facilityName(booking.getFacility().getName())
        .residentId(booking.getResident().getId())
        .residentName(booking.getResident().getFullName())
        .startTime(booking.getStartTime())
        .endTime(booking.getEndTime())
        .status(booking.getStatus())
        .notes(booking.getNotes())
        .active(booking.isActive())
        .build();
  }

  public MarketplaceItemResponse toMarketplaceItemResponse(MarketplaceItem item) {
    return MarketplaceItemResponse.builder()
        .id(item.getId())
        .residentId(item.getResident().getId())
        .residentName(item.getResident().getFullName())
        .title(item.getTitle())
        .description(item.getDescription())
        .price(item.getPrice())
        .category(item.getCategory())
        .status(item.getStatus())
        .active(item.isActive())
        .build();
  }

  public ToLetListingResponse toToLetListingResponse(ToLetListing listing) {
    return ToLetListingResponse.builder()
        .id(listing.getId())
        .residentId(listing.getResident().getId())
        .residentName(listing.getResident().getFullName())
        .title(listing.getTitle())
        .description(listing.getDescription())
        .rent(listing.getRent())
        .location(listing.getLocation())
        .status(listing.getStatus())
        .active(listing.isActive())
        .build();
  }

  public ServiceBookingResponse toServiceBookingResponse(ServiceBooking booking) {
    return ServiceBookingResponse.builder()
        .id(booking.getId())
        .residentId(booking.getResident().getId())
        .residentName(booking.getResident().getFullName())
        .serviceType(booking.getServiceType())
        .description(booking.getDescription())
        .preferredTime(booking.getPreferredTime())
        .status(booking.getStatus())
        .active(booking.isActive())
        .build();
  }

  public ParcelResponse toParcelResponse(Parcel parcel) {
    return ParcelResponse.builder()
        .id(parcel.getId())
        .residentId(parcel.getResident().getId())
        .residentName(parcel.getResident().getFullName())
        .trackingNumber(parcel.getTrackingNumber())
        .courierName(parcel.getCourierName())
        .description(parcel.getDescription())
        .receivedAt(parcel.getReceivedAt())
        .status(parcel.getStatus())
        .active(parcel.isActive())
        .build();
  }

  public com.ssasm.dto.community.PaymentResponse toPaymentResponse(com.ssasm.entity.community.Payment payment) {
    return com.ssasm.dto.community.PaymentResponse.builder()
        .id(payment.getId())
        .billId(payment.getBill().getId())
        .receiptNumber("REC-" + payment.getId() + "-" + System.currentTimeMillis() % 10000)
        .amountPaid(payment.getAmount())
        .paymentMethod(com.ssasm.enums.PaymentMethod.RAZORPAY)
        .paymentStatus(com.ssasm.enums.PaymentStatus.PAID)
        .transactionId(payment.getTransactionId())
        .paymentDate(payment.getPaymentDate() != null ? payment.getPaymentDate() : java.time.LocalDateTime.now())
        .build();
  }
}
