import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { EmergencySosModal } from '@/components/ui/EmergencySosModal';
import { ToastStack } from '@/components/ui/ToastStack';
import { ToastProvider, useToast } from '@/hooks/useToast';
import { useRole, UserRole } from '@/context/RoleContext';

function AppLayoutContent() {
  const { role, user, theme, login, logout } = useRole();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [switchTargetRole, setSwitchTargetRole] = useState<UserRole>('ADMIN');
  const [switchUsername, setSwitchUsername] = useState('');
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchError, setSwitchError] = useState('');

  const defaultPaths: Record<UserRole, string> = {
    ADMIN: '/dashboard/admin',
    RESIDENT: '/dashboard/resident',
    GUARD: '/dashboard/guard',
    STAFF: '/dashboard/staff',
  };

  const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Society Admin',
    RESIDENT: 'Resident',
    GUARD: 'Security Guard',
    STAFF: 'Society Staff',
  };

  const handleOpenSwitchModal = (targetRole?: UserRole) => {
    if (targetRole) setSwitchTargetRole(targetRole);
    setSwitchUsername('');
    setSwitchPassword('');
    setSwitchError('');
    setIsSwitchModalOpen(true);
  };

  const handleSwitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchUsername.trim() || !switchPassword.trim()) {
      setSwitchError('Please enter both username and password.');
      return;
    }

    setSwitchLoading(true);
    setSwitchError('');

    try {
      const authenticatedRole = await login(switchUsername, switchPassword);
      setIsSwitchModalOpen(false);
      pushToast({
        type: 'success',
        title: 'Authentication Successful',
        description: `Switched to ${roleLabels[authenticatedRole]} department.`
      });
      navigate(defaultPaths[authenticatedRole]);
    } catch {
      setSwitchError('Authentication failed: Invalid username or password for this department.');
    } finally {
      setSwitchLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bgGradient} text-slate-100 transition-colors duration-500`}>
      <ToastStack />

      {/* Mobile Top App Bar */}
      <MobileHeader
        onOpenMenu={() => setIsMobileDrawerOpen(true)}
        onOpenSos={() => setIsSosModalOpen(true)}
        onOpenSwitchRole={() => handleOpenSwitchModal()}
      />

      {/* Mobile Slide-Over Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onOpenSwitchRole={() => handleOpenSwitchModal()}
        onOpenSos={() => setIsSosModalOpen(true)}
      />

      {/* Mobile Emergency SOS Hotline Modal */}
      <EmergencySosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-[1700px] flex-col lg:flex-row">
        <SidebarNav />

        <main className="flex-1 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-5 pb-28 lg:pb-8">
          {/* Secured Desktop Top Bar (Hidden on Mobile) */}
          <header className="hidden lg:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3">
              <span className={`rounded-2xl border px-3.5 py-1.5 text-xs font-black tracking-wider ${theme.accentBorder} ${theme.accentBg} ${theme.accentText}`}>
                {theme.badge}
              </span>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">{theme.name}</h2>
                <p className="text-[11px] text-slate-400">
                  Logged in as: <span className="font-semibold text-slate-200">{user?.fullName || user?.username || 'Administrator'}</span>
                </p>
              </div>
            </div>

            {/* Authenticated Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-3.5 py-2">
                <span className="text-xs text-slate-400">Department:</span>
                <span className="text-xs font-bold text-cyan-300">
                  {roleLabels[role]}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenSwitchModal()}
                className="flex items-center gap-1.5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition shadow-sm"
                title="Requires password to switch department"
              >
                <span>🔑</span>
                <span>Switch Role</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 px-3.5 py-2 text-xs font-semibold text-slate-300 transition"
                title="Sign out of system"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </header>

          {/* Page Route Content */}
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav onOpenMenu={() => setIsMobileDrawerOpen(true)} />

      {/* Security Verification Modal for Role Switching */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[2.5rem] border border-cyan-500/40 bg-slate-900 p-8 shadow-2xl space-y-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">🔑</span>
                <div>
                  <h3 className="text-base font-bold text-white">Switch Department</h3>
                  <p className="text-xs text-slate-400">Select department and sign in</p>
                </div>
              </div>
              <button
                onClick={() => setIsSwitchModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-white/5">
              Enter your department credentials to switch accounts.
            </p>

            {switchError && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {switchError}
              </div>
            )}

            <form onSubmit={handleSwitchSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Department</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ADMIN', 'RESIDENT', 'GUARD', 'STAFF'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSwitchTargetRole(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left ${
                        switchTargetRole === r
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-sm'
                          : 'border-white/10 bg-slate-950/50 text-slate-400 hover:bg-slate-950 hover:text-white'
                      }`}
                    >
                      {r === 'ADMIN' ? '👑 Admin' : r === 'RESIDENT' ? '🏠 Resident' : r === 'GUARD' ? '🛡️ Guard' : '🔧 Staff'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Username *</label>
                <input
                  required
                  type="text"
                  placeholder="Enter target username"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition"
                  value={switchUsername}
                  onChange={e => setSwitchUsername(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password *</label>
                <input
                  required
                  type="password"
                  placeholder="Enter account password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 transition"
                  value={switchPassword}
                  onChange={e => setSwitchPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSwitchModalOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={switchLoading}
                  className="rounded-2xl bg-cyan-400 hover:bg-cyan-300 px-5 py-2.5 text-xs font-bold text-slate-950 transition disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                >
                  {switchLoading ? 'Verifying...' : 'Verify & Switch Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  return (
    <ToastProvider>
      <AppLayoutContent />
    </ToastProvider>
  );
}
