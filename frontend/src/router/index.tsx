import { Navigate, Route, Routes } from 'react-router-dom';
import { RoleProvider } from '@/context/RoleContext';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleSelectionPage } from '@/pages/RoleSelectionPage';
import { SocietyPage } from '@/pages/SocietyPage';
import { BuildingsPage } from '@/pages/BuildingsPage';
import { FlatsPage } from '@/pages/FlatsPage';
import { ResidentsPage } from '@/pages/ResidentsPage';
import { ResidentDetailsPage } from '@/pages/ResidentDetailsPage';
import { ResidentProfilePage } from '@/pages/ResidentProfilePage';
import { ResidentRegistrationPage } from '@/pages/ResidentRegistrationPage';
import { ResidentEditPage } from '@/pages/ResidentEditPage';
import { VisitorEntryPage } from '@/pages/visitor/VisitorEntryPage';
import { VisitorLogsPage } from '@/pages/visitor/VisitorLogsPage';
import { VisitorManagementPage } from '@/pages/visitor/VisitorManagementPage';

// Community Pages
import { ComplaintsPage } from '@/pages/community/ComplaintsPage';
import { StaffPage } from '@/pages/community/StaffPage';
import { BillingPaymentsPage } from '@/pages/community/BillingPaymentsPage';
import { ParkingPage } from '@/pages/community/ParkingPage';
import { FacilitiesPage } from '@/pages/community/FacilitiesPage';
import { MarketplacePage } from '@/pages/community/MarketplacePage';
import { ToLetPage } from '@/pages/community/ToLetPage';
import { ServicesPage } from '@/pages/community/ServicesPage';
import { ParcelsPage } from '@/pages/community/ParcelsPage';

// Role Dashboards & Audit/Reports
import { AdminDashboardPage } from '@/pages/dashboard/AdminDashboardPage';
import { ResidentDashboardPage } from '@/pages/dashboard/ResidentDashboardPage';
import { SecurityGuardDashboardPage } from '@/pages/dashboard/SecurityGuardDashboardPage';
import { StaffDashboardPage } from '@/pages/dashboard/StaffDashboardPage';
import { AuditViewerPage } from '@/pages/audit/AuditViewerPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { ResidentSelfRegisterPage } from '@/pages/auth/ResidentSelfRegisterPage';

export function AppRouter() {
  return (
    <RoleProvider>
      <Routes>
        {/* Interactive Role Selection Launchpad as Root / */}
        <Route path="/" element={<RoleSelectionPage />} />
        <Route path="/register" element={<ResidentSelfRegisterPage />} />

        {/* Multi-Portal Layout Routes */}
        <Route element={<AppLayout />}>
          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/society" element={<SocietyPage />} />
            <Route path="/buildings" element={<BuildingsPage />} />
            <Route path="/flats" element={<FlatsPage />} />
            <Route path="/residents" element={<ResidentsPage />} />
            <Route path="/residents/new" element={<ResidentRegistrationPage />} />
            <Route path="/residents/:residentId" element={<ResidentDetailsPage />} />
            <Route path="/residents/:residentId/edit" element={<ResidentEditPage />} />
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            <Route path="/audit" element={<AuditViewerPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Resident Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT']} />}>
            <Route path="/resident-profile" element={<ResidentProfilePage />} />
            <Route path="/dashboard/resident" element={<ResidentDashboardPage />} />
            <Route path="/billing" element={<BillingPaymentsPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/to-let" element={<ToLetPage />} />
            <Route path="/services" element={<ServicesPage />} />
          </Route>

          {/* Guard Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'GUARD']} />}>
            <Route path="/dashboard/guard" element={<SecurityGuardDashboardPage />} />
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
            <Route path="/dashboard/staff" element={<StaffDashboardPage />} />
          </Route>

          {/* Shared Seminar Module Routes (Complaints & Visitors) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT', 'GUARD', 'STAFF']} />}>
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/visitors" element={<VisitorManagementPage />} />
            <Route path="/visitors/entry" element={<VisitorEntryPage />} />
            <Route path="/visitors/logs" element={<VisitorLogsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/parking" element={<ParkingPage />} />
            <Route path="/parcels" element={<ParcelsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RoleProvider>
  );
}
