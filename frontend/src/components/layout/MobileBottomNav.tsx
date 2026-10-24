import { NavLink, useLocation } from 'react-router-dom';
import { useRole, UserRole } from '@/context/RoleContext';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

interface BottomNavItem {
  label: string;
  to?: string;
  icon: string;
  isAction?: boolean;
  action?: 'menu';
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const { role, theme } = useRole();
  const location = useLocation();

  const roleBottomNavItems: Record<UserRole, BottomNavItem[]> = {
    RESIDENT: [
      { label: 'Home', to: '/dashboard/resident', icon: '🏠' },
      { label: 'Pass', to: '/visitors/entry', icon: '🎟️' },
      { label: 'Dues', to: '/billing', icon: '💳' },
      { label: 'Issues', to: '/complaints', icon: '🎫' },
      { label: 'More', icon: '☰', isAction: true, action: 'menu' },
    ],
    ADMIN: [
      { label: 'Overview', to: '/dashboard/admin', icon: '📊' },
      { label: 'Residents', to: '/residents', icon: '👥' },
      { label: 'Flats', to: '/flats', icon: '🚪' },
      { label: 'Billing', to: '/billing', icon: '💳' },
      { label: 'More', icon: '☰', isAction: true, action: 'menu' },
    ],
    GUARD: [
      { label: 'Console', to: '/dashboard/guard', icon: '🛡️' },
      { label: 'Pass Scan', to: '/visitors/entry', icon: '🎟️' },
      { label: 'Gate Logs', to: '/visitors/logs', icon: '📋' },
      { label: 'Parcels', to: '/parcels', icon: '📦' },
      { label: 'More', icon: '☰', isAction: true, action: 'menu' },
    ],
    STAFF: [
      { label: 'Tasks', to: '/dashboard/staff', icon: '🔧' },
      { label: 'Work Orders', to: '/complaints', icon: '🎫' },
      { label: 'Directory', to: '/staff', icon: '👷' },
      { label: 'Parcels', to: '/parcels', icon: '📦' },
      { label: 'More', icon: '☰', isAction: true, action: 'menu' },
    ],
  };

  const navItems = roleBottomNavItems[role] || roleBottomNavItems.RESIDENT;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/95 px-2 py-1.5 backdrop-blur-2xl lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: 'calc(0.45rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={onOpenMenu}
                className="flex flex-1 flex-col items-center justify-center py-1 text-slate-400 hover:text-white active:scale-90 transition"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-sm">
                  {item.icon}
                </span>
                <span className="mt-1 text-[10px] font-medium tracking-tight">{item.label}</span>
              </button>
            );
          }

          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-90 ${
                isActive
                  ? `${theme.accentText} font-bold`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-xl text-base transition-all ${
                  isActive
                    ? `${theme.accentBg} ${theme.accentBorder} border shadow-sm`
                    : ''
                }`}
              >
                {item.icon}
              </span>
              <span className="mt-1 text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className={`mt-0.5 h-1 w-4 rounded-full ${theme.buttonBg}`} />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
