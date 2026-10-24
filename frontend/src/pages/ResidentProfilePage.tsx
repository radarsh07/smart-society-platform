import { useEffect, useState } from 'react';
import { residentApi } from '@/services';
import type { ResidentResponse } from '@/types/society';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { Link } from 'react-router-dom';

export function ResidentProfilePage() {
  const [resident, setResident] = useState<ResidentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    residentApi
      .getMyProfile()
      .then(setResident)
      .catch(() => setResident(null))
      .finally(() => setLoading(false));
  }, []);

  const gatePassToken = resident?.gatePassToken || 'GP-RES-6-101';

  const handleCopyToken = () => {
    navigator.clipboard.writeText(gatePassToken);
    setCopiedToken(true);
    pushToast({
      type: 'success',
      title: 'Token Copied! 📋',
      description: `Gate token "${gatePassToken}" copied to clipboard.`,
    });
    setTimeout(() => setCopiedToken(false), 3000);
  };

  return (
    <section className="space-y-6">
      <TopBar title="Resident Digital Profile & Gate Identity" subtitle="Official society credentials, digital gate pass, and registered household details." />

      {loading ? <LoadingSpinner /> : null}

      {resident ? (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Digital Gate Pass Identity Card (Left - 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-[2.5rem] border border-emerald-500/40 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  PERMANENT GATE PASS 🚗
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">FLAT {resident.flatNumber}</span>
              </div>

              <div className="my-6 text-center space-y-2">
                <div className="mx-auto h-20 w-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-4xl shadow-inner">
                  👤
                </div>
                <h3 className="text-2xl font-black text-white">{resident.fullName}</h3>
                <p className="text-xs text-slate-300">
                  {resident.occupancyType || 'OWNER'} • {resident.buildingName || 'Lavender Building'}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                    VERIFIED & ACTIVE 🟢
                  </span>
                </div>
              </div>

              {/* Token Showcase */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gate Pass Clearance Token</span>
                <div className="font-mono text-2xl font-black text-emerald-400 tracking-wider select-all">
                  {gatePassToken}
                </div>
                <p className="text-[10px] text-slate-400">Security Guard Barrier Auto-Clearance</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleCopyToken}
                  className="flex-1 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <span>{copiedToken ? '✓ Copied' : '📋 Copy Token'}</span>
                </button>
                <Link
                  to="/visitors/entry"
                  className="flex-1 py-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs transition text-center flex items-center justify-center gap-2"
                >
                  <span>🚗 Test at Gate</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Resident Demographic & Unit Details (Right - 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <article className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-xl">
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <span>📋</span> Unit & Contact Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Registered Full Name</span>
                  <p className="text-sm font-semibold text-white">{resident.fullName}</p>
                </div>

                <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Assigned Unit</span>
                  <p className="text-sm font-semibold text-cyan-300">
                    Flat {resident.flatNumber} ({resident.buildingName || 'Building'})
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Primary Mobile</span>
                  <p className="text-sm font-semibold text-white font-mono">{resident.phoneNumber}</p>
                </div>

                <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Email Address</span>
                  <p className="text-sm font-semibold text-white">{resident.email}</p>
                </div>

                <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Emergency Contact</span>
                  <p className="text-sm font-semibold text-rose-300">
                    {resident.emergencyContactName || 'N/A'} ({resident.emergencyContactPhone || 'Not Configured'})
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Blood Group</span>
                  <p className="text-sm font-semibold text-white">{resident.bloodGroup || 'O+ Positive'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 space-y-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>ℹ️</span> Security Guard Interaction Guide
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When you or your vehicle approach the entrance barrier, provide your gate pass token{' '}
                  <strong className="text-white font-mono">{gatePassToken}</strong>. The security guard enters this into
                  the gate terminal to log your entry and release the barrier instantly.
                </p>
              </div>
            </article>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">No resident profile loaded yet.</p>
      )}
    </section>
  );
}