package com.ssasm.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.dto.dashboard.AdminDashboardResponse;
import com.ssasm.dto.dashboard.GuardDashboardResponse;
import com.ssasm.dto.dashboard.ResidentDashboardResponse;
import com.ssasm.dto.dashboard.StaffDashboardResponse;
import com.ssasm.response.ApiResponse;
import com.ssasm.service.DashboardService;
import com.ssasm.util.ResponseUtil;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

  private final DashboardService dashboardService;

  public DashboardController(DashboardService dashboardService) {
    this.dashboardService = dashboardService;
  }

  @GetMapping("/admin")
  public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
    return ResponseEntity.ok(ResponseUtil.success("Admin dashboard data fetched", dashboardService.getAdminDashboard()));
  }

  @GetMapping("/resident/{residentId}")
  public ResponseEntity<ApiResponse<ResidentDashboardResponse>> getResidentDashboard(@PathVariable Long residentId) {
    return ResponseEntity.ok(ResponseUtil.success("Resident dashboard data fetched", dashboardService.getResidentDashboard(residentId)));
  }

  @GetMapping("/guard")
  public ResponseEntity<ApiResponse<GuardDashboardResponse>> getGuardDashboard() {
    return ResponseEntity.ok(ResponseUtil.success("Security guard dashboard data fetched", dashboardService.getGuardDashboard()));
  }

  @GetMapping("/staff/{staffId}")
  public ResponseEntity<ApiResponse<StaffDashboardResponse>> getStaffDashboard(@PathVariable Long staffId) {
    return ResponseEntity.ok(ResponseUtil.success("Society staff dashboard data fetched", dashboardService.getStaffDashboard(staffId)));
  }
}
