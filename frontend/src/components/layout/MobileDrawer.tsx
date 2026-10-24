import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRole, UserRole } from '@/context/RoleContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSwitchRole: () => void;
  onOpenSos: () => void;
}

export function MobileDrawer({ isOpen, onClose, onOpenSwitchRole, onOpenSos }: MobileDrawerProps) {
  const { role, theme, user, logout } = useRole();
  const navigate = useNavigate();

  // Close drawer on escape key & lock background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const adminNav = [
    { label: 'Admin Overview', to: '/dashboard/admin', icon: '📊' },
    { label: 'Society Master', to: '/society', icon: '🏛️' },
    { label: 'Buildings', to: '/buildings', icon: '🏢' },
    { label: 'Flats Management', to: '/flats', icon: '🚪' },
    { label: 'Resident Directory', to: '/residents', icon: '👥' },
    { label: 'Staff Management', to: '/staff', icon: '👷' },
    { label: 'Billing & Dues', to: '/billing', icon: '💳' },
    { label: 'Complaints Queue', to: '/complaints', icon: '🎫' },
    { label: 'Reports & Export', to: '/reports', icon: '📈' },
    { label: 'Security Audit Logs', to: '/audit', icon: '🛡️' },
  ];

  const residentNav = [
    { label: 'Resident Home', to: '/dashboard/resident', icon: '🏠' },
    { label: 'My Resident Profile', to: '/resident-profile', icon: '👤' },
    { label: 'Pay Dues & Bills', to: '/billing', icon: '💳' },
    { label: 'Invite Visitor (Pass)', to: '/visitors/entry', icon: '🎟️' },
    { label: 'Visitor Logs & History', to: '/visitors/logs', icon: '📋' },
    { label: 'My Complaints', to: '/complaints', icon: '🎫' },
    { label: 'Book Amenities', to: '/facilities', icon: '🏊' },
    { label: 'Marketplace', to: '/marketplace', icon: '🏷️' },
    { label: 'To-Let Rentals', to: '/to-let', icon: '🔑' },
    { label: 'Household Services', to: '/services', icon: '⚡' },
    { label: 'Parcel Notifications', to: '/parcels', icon: '📦' },
  ];

  const guardNav = [
    { label: 'Gate Security Console', to: '/dashboard/guard', icon: '🛡️' },
    { label: 'Verify & Entry Pass', to: '/visitors/entry', icon: '🎟️' },
    { label: 'Gate Entry/Exit Logs', to: '/visitors/logs', icon: '📋' },
    { label: 'Parcel Reception Desk', to: '/parcels', icon: '📦' },
    { label: 'Visitor Directory', to: '/visitors', icon: '👥' },
    { label: 'Staff Directory', to: '/staff', icon: '👷' },
  ];

  const staffNav = [
    { label: 'Staff Task Board', to: '/dashboard/staff', icon: '🔧' },
    { label: 'Assigned Work Orders', to: '/complaints', icon: '🎫' },
    { label: 'Staff Directory', to: '/staff', icon: '👷' },
    { label: 'Parcels Desk', to: '/parcels', icon: '📦' },
  ];

  const roleNavItems: Record<UserRole, typeof adminNav> = {
    ADMIN: adminNav,
    RESIDENT: residentNav,
    GUARD: guardNav,
    STAFF: staffNav,
  };

  const navItems = roleNavItems[role] || adminNav;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Dimmed backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Content Drawer */}
      <div className="relative flex w-[85%] max-w-sm flex-1 flex-col bg-slate-950 border-r border-white/10 shadow-2xl transition-transform">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏙️</span>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">SSASM Society</h2>
              <p className="text-[10px] text-slate-400">Mobile Management Console</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* User Profile Summary Card */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className={`rounded-2xl border ${theme.accentBorder} ${theme.accentBg} p-3.5 space-y-1.5`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-wider ${theme.accentText}`}>
                {theme.badge}
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenSwitchRole();
                }}
                className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300"
              >
                🔑 Switch Role
              </button>
            </div>
            <p className="text-sm font-bold text-white truncate">
              {user?.fullName || user?.username || 'Society Member'}
            </p>
            <p className="text-[11px] text-slate-400 leading-tight">
              {theme.userSub}
            </p>
          </div>

          {/* Quick SOS Trigger in Drawer */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSos();
            }}
            className="flex w-full items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 active:scale-98 transition"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🚨</span>
              <span>Emergency SOS & Contacts</span>
            </span>
            <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">Fast Dial</span>
          </button>
        </div>

        {/* Navigation Links Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 py-1">
            {theme.name} Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? `${theme.buttonBg} ${theme.buttonText} shadow-md`
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Drawer Footer Actions */}
        <div className="border-t border-white/10 p-4 space-y-2 bg-slate-950/80">
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                navigate('/');
              }}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-center text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              🚀 Launchpad
            </button>
            <button
              onClick={() => {
                onClose();
                logout();
                navigate('/');
              }}
              className="flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-center text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
            >
              🚪 Sign Out
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-500">
            SSASM Platform • Mobile Optimized
          </p>
        </div>
      </div>
    </div>
  );
}
