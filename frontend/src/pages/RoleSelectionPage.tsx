import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRole, ROLE_THEMES, UserRole } from '@/context/RoleContext';

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

  const accountPresets = [
    {
      role: 'ADMIN' as UserRole,
      title: 'Society Administrator',
      username: 'admin',
      pass: 'admin123',
      icon: '👑',
      badge: 'Full Admin',
      desc: 'Master governance. Setup society, buildings, flats, approve new residents, and review audit logs.',
      theme: ROLE_THEMES.ADMIN,
    },
    {
      role: 'RESIDENT' as UserRole,
      title: 'Resident Portal',
      username: '',
      pass: '',
      isResidentCard: true,
      icon: '🏠',
      badge: 'Private Member Login',
      desc: 'Each resident logs in with their own registered private username & password.',
      theme: ROLE_THEMES.RESIDENT,
    },
    {
      role: 'GUARD' as UserRole,
      title: 'Security Gate Console',
      username: 'guard',
      pass: 'guard123',
      icon: '🛡️',
      badge: 'Gate Console',
      desc: 'Gate visitor check-in/checkout, parcel receipts, and QR pass scanning.',
      theme: ROLE_THEMES.GUARD,
    },
    {
      role: 'STAFF' as UserRole,
      title: 'Maintenance Staff',
      username: 'staff',
      pass: 'staff123',
      icon: '🔧',
      badge: 'Staff Workbench',
      desc: 'View assigned work tickets, maintenance tickets, and submit work updates.',
      theme: ROLE_THEMES.STAFF,
    },
  ];

  const fillPresetCredentials = (presetUsername: string, presetPass: string, role: UserRole) => {
    setUsername(presetUsername);
    setPassword(presetPass);
    setSelectedRole(role);
    setErrorMessage('');
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
      const msg = err?.response?.data?.message || 'Invalid credentials. Please check your username and password.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(120,119,198,0.15),_transparent_50%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-12">
      <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-10">
        
        {/* Main Header Heading */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-cyan-300">
            <span>🛡️ SMART SOCIETY PLATFORM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Secure Smart Apartment Platform
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Role-Based Access Control (RBAC) Authentication Portal. Authenticate with valid system credentials to access role-specific dashboards.
          </p>
        </div>

        {/* Central Authentication Card */}
        {/* Central Authentication Layout */}
        <div className="grid md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Mobile Quick Role Selector Chips (Visible only on mobile screens < md) */}
          <div className="md:hidden space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Role Preset
              </span>
              <span className="text-[10px] text-cyan-400">Tap to auto-fill</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {accountPresets.map((preset) => {
                const isSelected = preset.isResidentCard
                  ? selectedRole === 'RESIDENT' && username !== 'admin' && username !== 'guard' && username !== 'staff'
                  : username === preset.username && password === preset.pass;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => {
                      if (preset.isResidentCard) {
                        setUsername('');
                        setPassword('');
                        setSelectedRole('RESIDENT');
                        setErrorMessage('');
                      } else {
                        fillPresetCredentials(preset.username, preset.pass, preset.role);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? preset.isResidentCard
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-sm'
                          : 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                        : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-[10px] mt-0.5 truncate w-full">{preset.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Left / Desktop: Account Credential Presets Selector (Hidden on mobile < md) */}
          <div className="hidden md:block md:col-span-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Account Role Credential
            </h2>
            
            <div className="space-y-3">
              {accountPresets.map((preset) => {
                const isSelected = preset.isResidentCard
                  ? selectedRole === 'RESIDENT' && username !== 'admin' && username !== 'guard' && username !== 'staff'
                  : username === preset.username && password === preset.pass;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => {
                      if (preset.isResidentCard) {
                        setUsername('');
                        setPassword('');
                        setSelectedRole('RESIDENT');
                        setErrorMessage('');
                      } else {
                        fillPresetCredentials(preset.username, preset.pass, preset.role);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                      isSelected
                        ? preset.isResidentCard
                          ? 'border-emerald-400 bg-slate-900/90 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400'
                          : 'border-cyan-400 bg-slate-900/90 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                        : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/70 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10">
                        {preset.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{preset.title}</h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            preset.isResidentCard
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border-white/5'
                          }`}>
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">{preset.desc}</p>
                        {preset.isResidentCard ? (
                          <div className="mt-2 text-[11px] font-medium text-emerald-300 flex items-center gap-1.5">
                            <span>🔒</span> Private individual login: enter your credentials
                          </div>
                        ) : (
                          <div className="mt-2 text-[11px] font-mono text-cyan-300">
                            Username: <span className="font-bold text-white">{preset.username}</span> | Password: <span className="font-bold text-white">{preset.pass}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
                Self-register your flat residency. Once submitted, your request is sent to the Society Admin for verification and approval.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
              >
                <span>📝</span> Register as New Resident →
              </Link>
            </div>
          </div>

          {/* Right / Main: Login Form */}
          <div className="md:col-span-7">
            <div className="rounded-3xl md:rounded-[2.5rem] border border-cyan-500/30 bg-slate-900/80 p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5 sm:space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span>🔐 Sign In to Portal</span>
                  </h2>
                  <span className="text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                    JWT Protected
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enter valid system credentials for authorization
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-center text-xs font-semibold text-rose-300">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      placeholder="e.g. admin, resident, guard, staff"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      placeholder="e.g. admin123, resident123, guard123, staff123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-4 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Authenticating Credentials...' : 'Sign In & Access Portal →'}
                </button>

                <div className="text-center pt-1">
                  <span className="text-xs text-slate-400">
                    New resident without an approved account?{' '}
                    <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
                      Register as Resident Member →
                    </Link>
                  </span>
                </div>
              </form>

              <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-xs text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">🔒 System Security Enforcements:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>BCrypt Password Hashing & JWT Authorization Token</li>
                  <li>Role-Based Access Control (RBAC) Endpoints</li>
                  <li>Single Society Model Architecture</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer info */}
      <footer className="mt-12 text-center text-xs text-slate-500">
        Secure Smart Apartment & Society Management Platform • Single Society Architecture
      </footer>
    </div>
  );
}
