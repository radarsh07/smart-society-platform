import { useRole } from '@/context/RoleContext';

interface MobileHeaderProps {
  onOpenMenu: () => void;
  onOpenSos: () => void;
  onOpenSwitchRole: () => void;
}

export function MobileHeader({ onOpenMenu, onOpenSos, onOpenSwitchRole }: MobileHeaderProps) {
  const { role, theme, user } = useRole();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      {/* Brand & Active Role */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMenu}
          aria-label="Open Navigation Menu"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 active:scale-95 transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
              SSASM
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className={`text-[10px] font-bold ${theme.accentText} truncate max-w-[130px]`}>
            {user?.fullName || theme.name.replace(' Portal', '')}
          </span>
        </div>
      </div>

      {/* Action Buttons: Emergency SOS + Switch Role */}
      <div className="flex items-center gap-2">
        {/* Emergency SOS Button */}
        <button
          onClick={onOpenSos}
          type="button"
          aria-label="Emergency SOS"
          className="flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-500/15 px-2.5 py-1.5 text-xs font-black text-rose-300 shadow-sm shadow-rose-500/20 active:scale-95 transition"
        >
          <span className="text-sm animate-bounce">🚨</span>
          <span className="text-[11px] font-extrabold tracking-wider">SOS</span>
        </button>

        {/* Role Badge / Switch Role */}
        <button
          onClick={onOpenSwitchRole}
          type="button"
          aria-label="Switch Department Role"
          className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold ${theme.accentBorder} ${theme.accentBg} ${theme.accentText} active:scale-95 transition`}
        >
          <span>{role === 'ADMIN' ? '👑' : role === 'RESIDENT' ? '🏠' : role === 'GUARD' ? '🛡️' : '🔧'}</span>
          <span className="text-[10px] uppercase">{role}</span>
        </button>
      </div>
    </header>
  );
}
