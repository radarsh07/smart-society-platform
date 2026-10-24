package com.ssasm.service.impl;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.dto.dashboard.AdminDashboardResponse;
import com.ssasm.dto.dashboard.GuardDashboardResponse;
import com.ssasm.dto.dashboard.ResidentDashboardResponse;
import com.ssasm.dto.dashboard.StaffDashboardResponse;
import com.ssasm.repository.community.ComplaintRepository;
import com.ssasm.repository.community.FacilityBookingRepository;
import com.ssasm.repository.community.MaintenanceBillRepository;
import com.ssasm.repository.community.ParcelRepository;
import com.ssasm.repository.community.ParkingAllocationRepository;
import com.ssasm.repository.community.ServiceBookingRepository;
import com.ssasm.repository.society.FlatRepository;
import com.ssasm.repository.society.ResidentRepository;
import com.ssasm.service.DashboardService;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

  private final ResidentRepository residentRepository;
  private final FlatRepository flatRepository;
  private final ComplaintRepository complaintRepository;
  private final MaintenanceBillRepository maintenanceBillRepository;
  private final FacilityBookingRepository facilityBookingRepository;
  private final ParkingAllocationRepository parkingAllocationRepository;
  private final ParcelRepository parcelRepository;
  private final ServiceBookingRepository serviceBookingRepository;

  public DashboardServiceImpl(
      ResidentRepository residentRepository,
      FlatRepository flatRepository,
      ComplaintRepository complaintRepository,
      MaintenanceBillRepository maintenanceBillRepository,
      FacilityBookingRepository facilityBookingRepository,
      ParkingAllocationRepository parkingAllocationRepository,
      ParcelRepository parcelRepository,
      ServiceBookingRepository serviceBookingRepository) {
    this.residentRepository = residentRepository;
    this.flatRepository = flatRepository;
    this.complaintRepository = complaintRepository;
    this.maintenanceBillRepository = maintenanceBillRepository;
    this.facilityBookingRepository = facilityBookingRepository;
    this.parkingAllocationRepository = parkingAllocationRepository;
    this.parcelRepository = parcelRepository;
    this.serviceBookingRepository = serviceBookingRepository;
  }

  @Override
  public AdminDashboardResponse getAdminDashboard() {
    long totalResidents = residentRepository.count();
    long occupiedFlats = flatRepository.countByStatus("OCCUPIED");
    long vacantFlats = flatRepository.countByStatus("VACANT");
    long pendingComplaints = complaintRepository.count();
    long activeFacilityBookings = facilityBookingRepository.count();
    long parcelStats = parcelRepository.count();
    long serviceStats = serviceBookingRepository.count();

    Map<String, Long> complaintTrends = new LinkedHashMap<>();
    for (String day : new String[]{"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}) {
      complaintTrends.put(day, 0L);
    }

    Map<String, BigDecimal> paymentTrends = new LinkedHashMap<>();
    for (String month : new String[]{"Jan", "Feb", "Mar", "Apr", "May"}) {
      paymentTrends.put(month, BigDecimal.ZERO);
    }

    Map<String, Long> visitorTraffic = new LinkedHashMap<>();
    visitorTraffic.put("Morning (6-12)", 0L);
    visitorTraffic.put("Afternoon (12-18)", 0L);
    visitorTraffic.put("Evening (18-24)", 0L);

    Map<String, Long> facilityUsage = new LinkedHashMap<>();
    facilityUsage.put("Clubhouse", 0L);
    facilityUsage.put("Swimming Pool", 0L);
    facilityUsage.put("Gymnasium", 0L);
    facilityUsage.put("Tennis Court", 0L);

    Map<String, Long> parkingOccupancy = new LinkedHashMap<>();
    parkingOccupancy.put("Allocated", 0L);
    parkingOccupancy.put("Available", 0L);

    Map<String, Long> serviceBookingStats = new LinkedHashMap<>();
    serviceBookingStats.put("Electrician", 0L);
    serviceBookingStats.put("Plumber", 0L);
    serviceBookingStats.put("Cleaning", 0L);
    serviceBookingStats.put("AC Repair", 0L);

    return AdminDashboardResponse.builder()
        .totalResidents(totalResidents)
        .occupiedFlats(occupiedFlats)
        .vacantFlats(vacantFlats)
        .visitorsToday(0L)
        .pendingComplaints(pendingComplaints)
        .resolvedComplaints(0L)
        .monthlyMaintenanceCollection(BigDecimal.ZERO)
        .pendingPayments(BigDecimal.ZERO)
        .activeFacilityBookings(activeFacilityBookings)
        .registeredServiceProviders(serviceStats)
        .parcelStatistics(parcelStats)
        .complaintTrends(complaintTrends)
        .paymentCollectionTrends(paymentTrends)
        .visitorTraffic(visitorTraffic)
        .facilityUsage(facilityUsage)
        .parkingOccupancy(parkingOccupancy)
        .serviceBookingStats(serviceBookingStats)
        .build();
  }

  @Override
  public ResidentDashboardResponse getResidentDashboard(Long residentId) {
    return ResidentDashboardResponse.builder()
        .pendingBills(BigDecimal.ZERO)
        .recentPayments(BigDecimal.ZERO)
        .activeComplaints(0L)
        .upcomingFacilityBookings(0L)
        .visitorInvitations(0L)
        .parcelNotifications(0L)
        .marketplaceActivity(0L)
        .toLetStatus(0L)
        .build();
  }

  @Override
  public GuardDashboardResponse getGuardDashboard() {
    return GuardDashboardResponse.builder()
        .visitorsWaitingApproval(0L)
        .todayEntries(0L)
        .todayExits(0L)
        .pendingParcels(0L)
        .activeServiceProviders(0L)
        .emergencyAlerts(0L)
        .build();
  }

  @Override
  public StaffDashboardResponse getStaffDashboard(Long staffId) {
    return StaffDashboardResponse.builder()
        .assignedComplaints(0L)
        .pendingTasks(0L)
        .completedTasks(0L)
        .attendanceSummary("No active shift recorded")
        .workSchedule("Schedule pending assignment")
        .build();
  }
}
