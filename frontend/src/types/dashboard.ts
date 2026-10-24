export interface AdminDashboardData {
  totalResidents: number;
  occupiedFlats: number;
  vacantFlats: number;
  visitorsToday: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  monthlyMaintenanceCollection: number;
  pendingPayments: number;
  activeFacilityBookings: number;
  registeredServiceProviders: number;
  parcelStatistics: number;
  complaintTrends: Record<string, number>;
  paymentCollectionTrends: Record<string, number>;
  visitorTraffic: Record<string, number>;
  facilityUsage: Record<string, number>;
  parkingOccupancy: Record<string, number>;
  serviceBookingStats: Record<string, number>;
}

export interface ResidentDashboardData {
  pendingBills: number;
  recentPayments: number;
  activeComplaints: number;
  upcomingFacilityBookings: number;
  visitorInvitations: number;
  parcelNotifications: number;
  marketplaceActivity: number;
  toLetStatus: number;
}

export interface GuardDashboardData {
  visitorsWaitingApproval: number;
  todayEntries: number;
  todayExits: number;
  pendingParcels: number;
  activeServiceProviders: number;
  emergencyAlerts: number;
}

export interface StaffDashboardData {
  assignedComplaints: number;
  pendingTasks: number;
  completedTasks: number;
  attendanceSummary: string;
  workSchedule: string;
}

export interface AuditLogItem {
  timestamp: string;
  username: string;
  role: string;
  ipAddress: string;
  action: string;
  entityName: string;
  entityId: string;
  result: string;
  detail: string;
}
