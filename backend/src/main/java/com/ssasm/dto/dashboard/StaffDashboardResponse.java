package com.ssasm.dto.dashboard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StaffDashboardResponse {
  private long assignedComplaints;
  private long pendingTasks;
  private long completedTasks;
  private String attendanceSummary;
  private String workSchedule;
}
