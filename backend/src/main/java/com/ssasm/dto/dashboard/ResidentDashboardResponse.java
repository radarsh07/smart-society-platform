package com.ssasm.dto.dashboard;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResidentDashboardResponse {
  private BigDecimal pendingBills;
  private BigDecimal recentPayments;
  private long activeComplaints;
  private long upcomingFacilityBookings;
  private long visitorInvitations;
  private long parcelNotifications;
  private long marketplaceActivity;
  private long toLetStatus;
}
