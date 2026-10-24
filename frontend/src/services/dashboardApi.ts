import { httpClient } from './httpClient';
import type { ApiResponse } from '@/types/api';
import type { AdminDashboardData, GuardDashboardData, ResidentDashboardData, StaffDashboardData, AuditLogItem } from '../types/dashboard';

export const dashboardApi = {
  getAdminDashboard: async (): Promise<ApiResponse<AdminDashboardData>> => {
    const res = await httpClient.get<ApiResponse<AdminDashboardData>>('/dashboard/admin');
    return res.data;
  },

  getResidentDashboard: async (residentId = 1): Promise<ApiResponse<ResidentDashboardData>> => {
    const res = await httpClient.get<ApiResponse<ResidentDashboardData>>(`/dashboard/resident/${residentId}`);
    return res.data;
  },

  getGuardDashboard: async (): Promise<ApiResponse<GuardDashboardData>> => {
    const res = await httpClient.get<ApiResponse<GuardDashboardData>>('/dashboard/guard');
    return res.data;
  },

  getStaffDashboard: async (staffId = 1): Promise<ApiResponse<StaffDashboardData>> => {
    const res = await httpClient.get<ApiResponse<StaffDashboardData>>(`/dashboard/staff/${staffId}`);
    return res.data;
  },

  getAuditLogs: async (username?: string, action?: string): Promise<ApiResponse<AuditLogItem[]>> => {
    const params = new URLSearchParams();
    if (username) params.append('username', username);
    if (action) params.append('action', action);
    const res = await httpClient.get<ApiResponse<AuditLogItem[]>>(`/audit-logs?${params.toString()}`);
    return res.data;
  },
};
