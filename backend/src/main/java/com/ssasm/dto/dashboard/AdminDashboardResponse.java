package com.ssasm.dto.dashboard;

import java.math.BigDecimal;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminDashboardResponse {
  private long totalResidents;
  private long occupiedFlats;
  private long vacantFlats;
  private long visitorsToday;
  private long pendingComplaints;
  private long resolvedComplaints;
  private BigDecimal monthlyMaintenanceCollection;
  private BigDecimal pendingPayments;
  private long activeFacilityBookings;
  private long registeredServiceProviders;
  private long parcelStatistics;

  private Map<String, Long> complaintTrends;
  private Map<String, BigDecimal> paymentCollectionTrends;
  private Map<String, Long> visitorTraffic;
  private Map<String, Long> facilityUsage;
  private Map<String, Long> parkingOccupancy;
  private Map<String, Long> serviceBookingStats;
}
