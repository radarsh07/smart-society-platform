package com.ssasm.mapper.community;

import java.util.ArrayList;
import java.util.List;
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
import com.ssasm.enums.ComplaintPriority;
import com.ssasm.enums.ComplaintStatus;

@Component
public class CommunityMapper {

  public ComplaintResponse toComplaintResponse(Complaint complaint) {
    if (complaint == null) {
      return null;
    }

    Long resId = null;
    String resName = "Resident";
    if (complaint.getResident() != null) {
      resId = complaint.getResident().getId();
      resName = complaint.getResident().getFullName();
    }

    Long catId = null;
    String catName = "General Maintenance";
    if (complaint.getCategory() != null) {
      catId = complaint.getCategory().getId();
      catName = complaint.getCategory().getName();
    }

    List<String> images = new ArrayList<>();
    if (complaint.getImageUrls() != null) {
      images.addAll(complaint.getImageUrls());
    }

    return ComplaintResponse.builder()
        .id(complaint.getId())
        .ticketNumber(complaint.getTicketNumber() != null ? complaint.getTicketNumber() : "CMP-" + complaint.getId())
        .residentId(resId)
        .residentName(resName)
        .categoryId(catId)
        .categoryName(catName)
        .subject(complaint.getSubject() != null ? complaint.getSubject() : "No Subject")
        .description(complaint.getDescription() != null ? complaint.getDescription() : "")
        .priority(complaint.getPriority() != null ? complaint.getPriority() : ComplaintPriority.MEDIUM)
        .status(complaint.getStatus() != null ? complaint.getStatus() : ComplaintStatus.OPEN)
        .assignedStaffId(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getId() : null)
        .assignedStaffName(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getFullName() : null)
        .assignedAt(complaint.getAssignedAt())
        .resolvedAt(complaint.getResolvedAt())
        .closedAt(complaint.getClosedAt())
        .feedbackRating(complaint.getFeedbackRating())
        .feedbackComment(complaint.getFeedbackComment())
        .imageUrls(images)
        .active(complaint.isActive())
        .build();
  }

  public StaffResponse toStaffResponse(Staff staff) {
    if (staff == null) return null;
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
    if (bill == null) return null;
    Long resId = null;
    String resName = "Resident";
    if (bill.getResident() != null) {
      resId = bill.getResident().getId();
      resName = bill.getResident().getFullName();
    }
    List<BillItemResponse> itemsList = new ArrayList<>();
    if (bill.getItems() != null) {
      itemsList = bill.getItems().stream().map(this::toBillItemResponse).toList();
    }
    return MaintenanceBillResponse.builder()
        .id(bill.getId())
        .residentId(resId)
        .residentName(resName)
        .billNumber(bill.getBillNumber())
        .billingMonth(bill.getBillingMonth())
        .dueDate(bill.getDueDate())
        .totalAmount(bill.getTotalAmount())
        .paidAmount(bill.getPaidAmount())
        .outstandingAmount(bill.getOutstandingAmount())
        .status(bill.getStatus())
        .items(itemsList)
        .active(bill.isActive())
        .build();
  }

  public BillItemResponse toBillItemResponse(BillItem item) {
    if (item == null) return null;
    return BillItemResponse.builder()
        .id(item.getId())
        .name(item.getName())
        .description(item.getDescription())
        .amount(item.getAmount())
        .build();
  }

  public VehicleResponse toVehicleResponse(Vehicle vehicle) {
    if (vehicle == null) return null;
    Long resId = null;
    String resName = "Resident";
    if (vehicle.getResident() != null) {
      resId = vehicle.getResident().getId();
      resName = vehicle.getResident().getFullName();
    }
    return VehicleResponse.builder()
        .id(vehicle.getId())
        .residentId(resId)
        .residentName(resName)
        .vehicleNumber(vehicle.getVehicleNumber())
        .make(vehicle.getMake())
        .model(vehicle.getModel())
        .color(vehicle.getColor())
        .active(vehicle.isActive())
        .build();
  }

  public ParkingAllocationResponse toParkingAllocationResponse(ParkingAllocation allocation) {
    if (allocation == null) return null;
    Long resId = null;
    String resName = "Resident";
    if (allocation.getResident() != null) {
      resId = allocation.getResident().getId();
      resName = allocation.getResident().getFullName();
    }
    Long slotId = null;
    String slotNum = "P-01";
    if (allocation.getSlot() != null) {
      slotId = allocation.getSlot().getId();
      slotNum = allocation.getSlot().getSlotNumber();
    }
    return ParkingAllocationResponse.builder()
        .id(allocation.getId())
        .residentId(resId)
        .residentName(resName)
        .slotId(slotId)
        .slotNumber(slotNum)
        .vehicleId(allocation.getVehicle() != null ? allocation.getVehicle().getId() : null)
        .vehicleNumber(allocation.getVehicle() != null ? allocation.getVehicle().getVehicleNumber() : null)
        .allocatedAt(allocation.getAllocatedAt())
        .expiresAt(allocation.getExpiresAt())
        .active(allocation.isActive())
        .build();
  }

  public FacilityBookingResponse toFacilityBookingResponse(FacilityBooking booking) {
    if (booking == null) return null;
    Long resId = null;
    String resName = "Resident";
    if (booking.getResident() != null) {
      resId = booking.getResident().getId();
      resName = booking.getResident().getFullName();
    }
    Long facId = null;
    String facName = "Facility";
    if (booking.getFacility() != null) {
      facId = booking.getFacility().getId();
      facName = booking.getFacility().getName();
    }
    return FacilityBookingResponse.builder()
        .id(booking.getId())
        .facilityId(facId)
        .facilityName(facName)
        .residentId(resId)
        .residentName(resName)
        .startTime(booking.getStartTime())
        .endTime(booking.getEndTime())
        .status(booking.getStatus())
        .notes(booking.getNotes())
        .active(booking.isActive())
        .build();
  }

  public MarketplaceItemResponse toMarketplaceItemResponse(MarketplaceItem item) {
    if (item == null) return null;
    Long resId = null;
    String resName = "Resident";
    if (item.getResident() != null) {
      resId = item.getResident().getId();
      resName = item.getResident().getFullName();
    }
    return MarketplaceItemResponse.builder()
        .id(item.getId())
        .residentId(resId)
        .residentName(resName)
        .title(item.getTitle())
        .description(item.getDescription())
        .price(item.getPrice())
        .category(item.getCategory())
        .status(item.getStatus())
        .active(item.isActive())
        .build();
  }

  public ToLetListingResponse toToLetListingResponse(ToLetListing listing) {
    if (listing == null) return null;
    Long resId = null;
    String resName = "Resident";
    if (listing.getResident() != null) {
      resId = listing.getResident().getId();
      resName = listing.getResident().getFullName();
    }
    return ToLetListingResponse.builder()
        .id(listing.getId())
        .residentId(resId)
        .residentName(resName)
        .title(listing.getTitle())
        .description(listing.getDescription())
        .rent(listing.getRent())
        .location(listing.getLocation())
        .status(listing.getStatus())
        .active(listing.isActive())
        .build();
  }

  public ServiceBookingResponse toServiceBookingResponse(ServiceBooking booking) {
    if (booking == null) return null;
    Long resId = null;
    String resName = "Resident";
    if (booking.getResident() != null) {
      resId = booking.getResident().getId();
      resName = booking.getResident().getFullName();
    }
    return ServiceBookingResponse.builder()
        .id(booking.getId())
        .residentId(resId)
        .residentName(resName)
        .serviceType(booking.getServiceType())
        .description(booking.getDescription())
        .preferredTime(booking.getPreferredTime())
        .status(booking.getStatus())
        .active(booking.isActive())
        .build();
  }

  public ParcelResponse toParcelResponse(Parcel parcel) {
    if (parcel == null) return null;
    Long resId = null;
    String resName = "Resident";
    if (parcel.getResident() != null) {
      resId = parcel.getResident().getId();
      resName = parcel.getResident().getFullName();
    }
    return ParcelResponse.builder()
        .id(parcel.getId())
        .residentId(resId)
        .residentName(resName)
        .trackingNumber(parcel.getTrackingNumber())
        .courierName(parcel.getCourierName())
        .description(parcel.getDescription())
        .receivedAt(parcel.getReceivedAt())
        .status(parcel.getStatus())
        .active(parcel.isActive())
        .build();
  }

  public com.ssasm.dto.community.PaymentResponse toPaymentResponse(com.ssasm.entity.community.Payment payment) {
    if (payment == null) return null;
    Long billId = null;
    if (payment.getBill() != null) {
      billId = payment.getBill().getId();
    }
    return com.ssasm.dto.community.PaymentResponse.builder()
        .id(payment.getId())
        .billId(billId)
        .receiptNumber("REC-" + payment.getId() + "-" + System.currentTimeMillis() % 10000)
        .amountPaid(payment.getAmount())
        .paymentMethod(com.ssasm.enums.PaymentMethod.RAZORPAY)
        .paymentStatus(com.ssasm.enums.PaymentStatus.PAID)
        .transactionId(payment.getTransactionId())
        .paymentDate(payment.getPaymentDate() != null ? payment.getPaymentDate() : java.time.LocalDateTime.now())
        .build();
  }
}
