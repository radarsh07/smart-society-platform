import React, { createContext, useContext, useState, useEffect } from 'react';
import { httpClient } from '@/services/httpClient';

export type UserRole = 'ADMIN' | 'RESIDENT' | 'GUARD' | 'STAFF';

export interface UserInfo {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roleName: string;
}

export interface RoleTheme {
  name: string;
  badge: string;
  bgGradient: string;
  accentBorder: string;
  accentText: string;
  accentBg: string;
  buttonBg: string;
  buttonText: string;
  userTitle: string;
  userSub: string;
}

export const ROLE_THEMES: Record<UserRole, RoleTheme> = {
  ADMIN: {
    name: 'Society Admin Portal',
    badge: '👑 ADMIN MODE',
    bgGradient: 'from-purple-950/90 via-slate-950 to-slate-950',
    accentBorder: 'border-purple-500/30',
    accentText: 'text-purple-300',
    accentBg: 'bg-purple-500/10',
    buttonBg: 'bg-purple-500 hover:bg-purple-400',
    buttonText: 'text-white',
    userTitle: 'Society Administrator',
    userSub: 'Full Governance & Financial Control',
  },
  RESIDENT: {
    name: 'Resident Portal',
    badge: '🏠 RESIDENT MODE',
    bgGradient: 'from-emerald-950/90 via-slate-950 to-slate-950',
    accentBorder: 'border-emerald-500/30',
    accentText: 'text-emerald-300',
    accentBg: 'bg-emerald-500/10',
    buttonBg: 'bg-emerald-400 hover:bg-emerald-300',
    buttonText: 'text-slate-950',
    userTitle: 'Resident (Flat A-302)',
    userSub: 'Home Management & Dues',
  },
  GUARD: {
    name: 'Gate Security Console',
    badge: '🛡️ SECURITY GUARD MODE',
    bgGradient: 'from-amber-950/90 via-slate-950 to-slate-950',
    accentBorder: 'border-amber-500/30',
    accentText: 'text-amber-300',
    accentBg: 'bg-amber-500/10',
    buttonBg: 'bg-amber-400 hover:bg-amber-300',
    buttonText: 'text-slate-950',
    userTitle: 'Gate Security Guard (Gate #1)',
    userSub: 'Visitor Pass Verification & Check-in',
  },
  STAFF: {
    name: 'Society Staff Workbench',
    badge: '🔧 STAFF WORKBENCH',
    bgGradient: 'from-cyan-950/90 via-slate-950 to-slate-950',
    accentBorder: 'border-cyan-500/30',
    accentText: 'text-cyan-300',
    accentBg: 'bg-cyan-500/10',
    buttonBg: 'bg-cyan-400 hover:bg-cyan-300',
    buttonText: 'text-slate-950',
    userTitle: 'Maintenance Technician',
    userSub: 'Plumbing & Electrical Work Orders',
  },
};

export function mapBackendRoleToFrontend(roleName?: string): UserRole {
  switch (roleName) {
    case 'SOCIETY_ADMIN': return 'ADMIN';
    case 'RESIDENT': return 'RESIDENT';
    case 'SECURITY_GUARD': return 'GUARD';
    case 'SOCIETY_STAFF': return 'STAFF';
    default: return 'ADMIN';
  }
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: UserInfo | null;
  token: string | null;
  theme: RoleTheme;
  login: (username: string, password: String) => Promise<UserRole>;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('ssasm_role');
    return (saved as UserRole) || 'ADMIN';
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ssasm_token'));
  const [user, setUser] = useState<UserInfo | null>(() => {
    const savedUser = localStorage.getItem('ssasm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('ssasm_role', newRole);
  };

  const login = async (username: string, password: String): Promise<UserRole> => {
    try {
      const response = await httpClient.post('/auth/login', { username, password });
      const data = response.data.data;
      const accessToken = data.accessToken;
      const rawUser = data.user || {};
      const userRole = (data.role || rawUser.role || 'SOCIETY_ADMIN').toString();
      const userObj: UserInfo = {
        id: rawUser.id || 1,
        username: rawUser.username || username,
        fullName: rawUser.fullName || username,
        email: rawUser.email || '',
        roleName: userRole,
      };

      localStorage.setItem('ssasm_token', accessToken);
      localStorage.setItem('ssasm_user', JSON.stringify(userObj));
      setToken(accessToken);
      setUser(userObj);

      const mappedRole = mapBackendRoleToFrontend(userRole);
      setRole(mappedRole);
      return mappedRole;
    } catch (err) {
      console.error('Authentication failed against backend:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('ssasm_token');
    localStorage.removeItem('ssasm_user');
    localStorage.removeItem('ssasm_role');
    setToken(null);
    setUser(null);
    setRoleState('ADMIN');
  };

  return (
    <RoleContext.Provider value={{ role, setRole, user, token, theme: ROLE_THEMES[role], login, logout }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
