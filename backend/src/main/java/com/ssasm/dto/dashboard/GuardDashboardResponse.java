package com.ssasm.dto.dashboard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GuardDashboardResponse {
  private long visitorsWaitingApproval;
  private long todayEntries;
  private long todayExits;
  private long pendingParcels;
  private long activeServiceProviders;
  private long emergencyAlerts;
}
