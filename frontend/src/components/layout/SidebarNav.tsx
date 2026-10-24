import { NavLink, useNavigate } from 'react-router-dom';
import { useRole, UserRole } from '@/context/RoleContext';

export function SidebarNav() {
  const { role, theme, logout } = useRole();
  const navigate = useNavigate();

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
  ];

  const staffNav = [
    { label: 'Staff Task Board', to: '/dashboard/staff', icon: '🔧' },
    { label: 'Assigned Work Orders', to: '/complaints', icon: '🎫' },
    { label: 'Staff Directory', to: '/staff', icon: '👷' },
  ];

  const roleNavItems: Record<UserRole, typeof adminNav> = {
    ADMIN: adminNav,
    RESIDENT: residentNav,
    GUARD: guardNav,
    STAFF: staffNav,
  };

  const navItems = roleNavItems[role] || adminNav;

  return (
    <aside className="flex w-full flex-col gap-6 border-r border-white/10 bg-slate-950/90 p-5 lg:min-h-screen lg:w-72 overflow-y-auto">
      {/* Brand Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] font-extrabold text-cyan-400">
            SSASM PLATFORM
          </span>
          <button
            onClick={() => navigate('/')}
            title="Switch Portal Launchpad"
            className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            Launchpad
          </button>
        </div>

        {/* Dynamic Active Role Badge Card */}
        <div className={`rounded-2xl border ${theme.accentBorder} ${theme.accentBg} p-4 space-y-1`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-extrabold ${theme.accentText}`}>
              {theme.badge}
            </span>
          </div>
          <p className="text-sm font-bold text-white">{theme.userTitle}</p>
          <p className="text-[11px] text-slate-400 leading-tight">{theme.userSub}</p>
        </div>
      </div>

      {/* Role Navigation Menu */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3">
          {theme.name} Menu
        </p>
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold transition ${
                  isActive
                    ? `${theme.buttonBg} ${theme.buttonText} shadow-lg`
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sign Out Action in Sidebar Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2">
          Account Security
        </p>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-rose-500/20 hover:border-rose-500/40 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-rose-200 transition flex items-center justify-between"
        >
          <span>Sign Out</span>
          <span>🚪</span>
        </button>
      </div>
    </aside>
  );
}
