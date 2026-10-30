import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRole, UserRole } from '@/context/RoleContext';

export function RoleSelectionPage() {
  const { login } = useRole();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const defaultPaths: Record<UserRole, string> = {
    ADMIN: '/dashboard/admin',
    RESIDENT: '/dashboard/resident',
    GUARD: '/dashboard/guard',
    STAFF: '/dashboard/staff',
  };

  const portalOptions = [
    {
      role: 'ADMIN' as UserRole,
      title: 'Society Admin',
      subtitle: 'Society governance & operations',
      defaultUser: 'admin',
      defaultPass: 'admin123',
      icon: '👑',
      badge: 'Admin',
    },
    {
      role: 'RESIDENT' as UserRole,
      title: 'Resident Portal',
      subtitle: 'Visitor passes, dues & complaints',
      defaultUser: '',
      defaultPass: '',
      isResident: true,
      icon: '🏠',
      badge: 'Resident',
    },
    {
      role: 'GUARD' as UserRole,
      title: 'Security Desk',
      subtitle: 'Gate check-in & visitor logs',
      defaultUser: 'guard',
      defaultPass: 'guard123',
      icon: '🛡️',
      badge: 'Security',
    },
    {
      role: 'STAFF' as UserRole,
      title: 'Maintenance Staff',
      subtitle: 'Work orders & service requests',
      defaultUser: 'staff',
      defaultPass: 'staff123',
      icon: '🔧',
      badge: 'Staff',
    },
  ];

  const handleSelectPortal = (portal: typeof portalOptions[0]) => {
    setSelectedRole(portal.role);
    setErrorMessage('');
    if (portal.isResident) {
      setUsername('');
      setPassword('');
    } else {
      setUsername(portal.defaultUser);
      setPassword(portal.defaultPass);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const authenticatedRole = await login(username, password);
      const targetPath = defaultPaths[authenticatedRole] || '/dashboard/admin';
      navigate(targetPath);
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setErrorMessage('Backend server is taking too long to respond (likely waking up from Render cold start). Please wait 20 seconds and click Sign In again.');
      } else if (!err.response) {
        setErrorMessage('Cannot connect to backend server. Please verify your Render service is active.');
      } else {
        const msg = err?.response?.data?.message || 'Invalid username or password. Please try again.';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(120,119,198,0.15),_transparent_50%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-12">
      <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-10">
        
        {/* Main Clean Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
            <span>🏙️ SMART SOCIETY PLATFORM</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Welcome to Smart Society
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Sign in to access your society dashboard, manage visitor gate passes, and handle community services.
          </p>
        </div>

        {/* Central Authentication Card Layout */}
        <div className="grid md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Mobile Portal Selector Chips (< md screens) */}
          <div className="md:hidden space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Portal
            </span>
            <div className="grid grid-cols-4 gap-2">
              {portalOptions.map((portal) => {
                const isSelected = selectedRole === portal.role;
                return (
                  <button
                    key={portal.role}
                    type="button"
                    onClick={() => handleSelectPortal(portal)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                        : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{portal.icon}</span>
                    <span className="text-[10px] truncate w-full">{portal.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Left Column: Clean Portal Cards (Desktop >= md screens) */}
          <div className="hidden md:block md:col-span-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Portal
            </h2>
            
            <div className="space-y-2.5">
              {portalOptions.map((portal) => {
                const isSelected = selectedRole === portal.role;
                return (
                  <button
                    key={portal.role}
                    type="button"
                    onClick={() => handleSelectPortal(portal)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-900/95 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                        : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/70 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center text-xl rounded-xl bg-white/5 border border-white/10">
                        {portal.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{portal.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{portal.subtitle}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}>
                      {portal.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Resident Self-Registration Banner */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2 mt-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span>✨ New Resident Member?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Self-register your flat residency online. Your application will be sent to the admin for review.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
              >
                <span>📝</span> Register as New Resident →
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Login Form */}
          <div className="md:col-span-7">
            <div className="rounded-3xl md:rounded-[2.5rem] border border-cyan-500/30 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🔐 Sign In</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your account details to access your portal
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-center text-xs font-semibold text-rose-300">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-3.5 sm:py-4 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>

                <div className="text-center pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-400">
                    New resident without an account?{' '}
                    <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
                      Register as Resident Member →
                    </Link>
                  </span>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-500">
        Smart Society Management Platform • All rights reserved
      </footer>
    </div>
  );
}
