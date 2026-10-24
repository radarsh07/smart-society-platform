import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useRole, UserRole } from '@/context/RoleContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { role, token } = useRole();

  if (!token && !localStorage.getItem('ssasm_token')) {
    // If not logged in, redirect to login / role selection page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user's role is not authorized for this route, redirect to their role dashboard
    const defaultDashboards: Record<UserRole, string> = {
      ADMIN: '/dashboard/admin',
      RESIDENT: '/dashboard/resident',
      GUARD: '/dashboard/guard',
      STAFF: '/dashboard/staff',
    };
    return <Navigate to={defaultDashboards[role]} replace />;
  }

  return <Outlet />;
};
