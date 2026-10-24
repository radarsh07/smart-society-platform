package com.ssasm.service;

import com.ssasm.dto.dashboard.AdminDashboardResponse;
import com.ssasm.dto.dashboard.GuardDashboardResponse;
import com.ssasm.dto.dashboard.ResidentDashboardResponse;
import com.ssasm.dto.dashboard.StaffDashboardResponse;

public interface DashboardService {
  AdminDashboardResponse getAdminDashboard();
  ResidentDashboardResponse getResidentDashboard(Long residentId);
  GuardDashboardResponse getGuardDashboard();
  StaffDashboardResponse getStaffDashboard(Long staffId);
}
