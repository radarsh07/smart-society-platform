import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/dashboardApi';
import { residentApi, visitorApi } from '@/services';
import type { ResidentDashboardData } from '@/types/dashboard';
import type { ResidentResponse } from '@/types/society';
import type { VisitorInvitationResponse } from '@/types/visitor';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { Link } from 'react-router-dom';

export function ResidentDashboardPage() {
  const { pushToast } = useToast();
  const [data, setData] = useState<ResidentDashboardData | null>(null);
  const [profile, setProfile] = useState<ResidentResponse | null>(null);
  const [invitations, setInvitations] = useState<VisitorInvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, profileRes, invRes] = await Promise.allSettled([
        dashboardApi.getResidentDashboard(),
        residentApi.getMyProfile(),
        visitorApi.listInvitations(0, 50, 'createdAt', 'DESC'),
      ]);

      if (dashRes.status === 'fulfilled') {
        setData(dashRes.value.data);
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
      }
      if (invRes.status === 'fulfilled') {
        setInvitations(invRes.value.content || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const gatePassToken = profile?.gatePassToken || 'GP-RES-6-101';
  const flatNumber = profile?.flatNumber || '101';
  const buildingName = profile?.buildingName || 'Lavender';
  const residentName = profile?.fullName || 'Abhishek';

  // Filter incoming pending visitors specifically for this flat/resident
  const pendingVisitors = invitations.filter((i) => i.passStatus === 'PENDING');
  const activeVisitors = invitations.filter((i) => i.passStatus === 'APPROVED' || i.passStatus === 'ACTIVE');

  const handleCopyToken = () => {
    navigator.clipboard.writeText(gatePassToken);
    setCopiedToken(true);
    pushToast({
      type: 'success',
      title: 'Token Copied! 📋',
      description: `Gate token "${gatePassToken}" copied to clipboard. Share with security guard for fast clearance.`,
    });
    setTimeout(() => setCopiedToken(false), 3000);
  };

  const handleApproveVisitor = async (invitationId: number, visitorName: string) => {
    setActionLoadingId(invitationId);
    try {
      await visitorApi.approveInvitation(invitationId, {
        passStatus: 'APPROVED',
        notes: `Approved by resident ${residentName} from mobile/resident portal`,
      });
      pushToast({
        type: 'success',
        title: 'Visitor Pass Approved! 🟢',
        description: `Access granted for ${visitorName}. Gate security barrier can now open.`,
      });
      loadAllData();
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Approval Failed',
        description: err?.response?.data?.message || 'Could not approve visitor.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectVisitor = async (invitationId: number, visitorName: string) => {
    setActionLoadingId(invitationId);
    try {
      await visitorApi.approveInvitation(invitationId, {
        passStatus: 'REJECTED',
        notes: `Rejected by resident ${residentName} from resident portal`,
      });
      pushToast({
        type: 'error',
        title: 'Visitor Denied 🔴',
        description: `Entry denied for ${visitorName}. Security guard instructed to turn visitor away.`,
      });
      loadAllData();
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Action Failed',
        description: err?.response?.data?.message || 'Could not reject visitor.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAsTrusted = async (item: VisitorInvitationResponse) => {
    try {
      await visitorApi.createTrustedVisitor({
        residentId: profile?.id || item.residentId || 6,
        visitorName: item.visitorName,
        visitorPhone: item.visitorPhone,
        visitorCompany: item.visitorCompany || 'Frequent Guest',
        notes: `Pre-authorized trusted visitor for Flat ${flatNumber}`,
      });
      pushToast({
        type: 'success',
        title: 'Added to Trusted Visitors ⭐',
        description: `${item.visitorName} will now have automated instant gate entry without repeated calls.`,
      });
      loadAllData();
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Could not mark trusted',
        description: err?.response?.data?.message || 'Failed to save trusted visitor.',
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-6">
      <TopBar
        title="Resident Dashboard & Security Hub"
        subtitle={`Welcome back, ${residentName}! Manage your digital gate pass, approve visitors at the gate, track tickets, and pay dues.`}
      />

      {/* 1. PERMANENT DIGITAL GATE PASS CARD (HERO) */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>🛡️</span> VERIFIED SOCIETY RESIDENT • PERMANENT PASS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {residentName} <span className="text-emerald-400 font-mono text-xl sm:text-2xl">({flatNumber} - {buildingName})</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This is your permanent digital gate clearance token. Share or present this code to the gate security guard
              for instantaneous RFID/barrier opening without delays or manual questioning.
            </p>
          </div>

          {/* Token Box & Actions */}
          <div className="w-full lg:w-auto rounded-3xl border border-emerald-500/40 bg-slate-950/80 p-5 space-y-4 shadow-xl">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Official Gate Pass Token
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tracking-wider">
                {gatePassToken}
              </div>
              <span className="inline-block text-[10px] text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                BARRIER AUTO-CLEARANCE ENABLED 🟢
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleCopyToken}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <span>{copiedToken ? '✓ Copied' : '📋 Copy Token'}</span>
              </button>
              <Link
                to="/visitors/entry"
                className="flex-1 px-4 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs transition text-center flex items-center justify-center gap-2"
              >
                <span>🚗 Test Clearance</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME VISITOR GATE APPROVALS CENTER */}
      <div className="rounded-[2.5rem] border border-amber-500/30 bg-slate-900/80 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-500/40 animate-pulse">
              🚨
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Live Visitor Gate Approvals
                {pendingVisitors.length > 0 && (
                  <span className="rounded-full bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5">
                    {pendingVisitors.length} PENDING
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Incoming friends, family, and delivery personnel currently waiting at Gate #1 for your approval.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              className="text-xs px-3.5 py-2 rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
            >
              <span>🔄</span> Refresh Status
            </button>
            <Link
              to="/visitors/logs"
              className="text-xs px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 font-semibold transition"
            >
              View Full Logs →
            </Link>
          </div>
        </div>

        {/* Pending Visitor Cards */}
        {pendingVisitors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center space-y-2">
            <span className="text-3xl block">🛡️</span>
            <p className="text-sm font-semibold text-slate-300">No pending visitor approval requests right now</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When a guest or friend arrives at the gate, the security guard will prompt an entry verification here.
              The barrier remains locked until you grant approval.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingVisitors.map((v) => (
              <div
                key={v.id}
                className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      WAITING AT GATE #1 ⏳
                    </span>
                    <h4 className="text-lg font-bold text-white">{v.visitorName}</h4>
                    <p className="text-xs text-slate-300 font-mono">
                      Phone: <span className="text-cyan-300 font-bold">{v.visitorPhone}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Category: {v.visitorCompany || 'Friends & Family'} • Purpose: {v.purpose || 'Personal Visit'}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10">
                    {v.qrCodeToken}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    disabled={actionLoadingId === v.id}
                    onClick={() => handleRejectVisitor(v.id, v.visitorName)}
                    className="flex-1 py-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition disabled:opacity-50"
                  >
                    <span>🔴 Reject Entry</span>
                  </button>
                  <button
                    disabled={actionLoadingId === v.id}
                    onClick={() => handleApproveVisitor(v.id, v.visitorName)}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <span>🟢 Approve & Open Barrier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Currently Active/Checked-in Guests */}
        {activeVisitors.length > 0 && (
          <div className="pt-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Approved Guests Currently Inside Society ({activeVisitors.length}):
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeVisitors.slice(0, 3).map((av) => (
                <div
                  key={av.id}
                  className="rounded-2xl border border-emerald-500/20 bg-slate-950/60 p-4 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white text-sm">{av.visitorName}</h5>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        APPROVED 🟢
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{av.visitorPhone}</p>
                    <p className="text-[11px] text-slate-500">Token: {av.qrCodeToken}</p>
                  </div>
                  <button
                    onClick={() => handleMarkAsTrusted(av)}
                    className="w-full mt-2 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-[11px] transition"
                  >
                    ⭐ Mark as Trusted Visitor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. SOCIETY METRICS OVERVIEW */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Pending Dues" value={`₹${data?.pendingBills ?? 0}`} label="Pay Online" to="/billing" color="amber" />
        <Card title="Active Tickets" value={data?.activeComplaints ?? 0} label="View Complaints" to="/complaints" color="cyan" />
        <Card title="Facility Bookings" value={data?.upcomingFacilityBookings ?? 0} label="Book Amenities" to="/facilities" color="emerald" />
        <Card title="Parcel Deliveries" value={data?.parcelNotifications ?? 0} label="View Parcels" to="/parcels" color="rose" />
      </div>

      {/* 4. QUICK ACTIONS & TRUSTED SYSTEM */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Quick Community Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/visitors/entry" className="rounded-2xl border border-white/10 bg-slate-950 p-4 hover:border-cyan-400 transition-colors text-center">
              <span className="text-2xl">🎟️</span>
              <p className="mt-2 text-sm font-semibold text-white">Invite Visitor</p>
              <p className="text-xs text-slate-400">Generate Pass</p>
            </Link>
            <Link to="/services" className="rounded-2xl border border-white/10 bg-slate-950 p-4 hover:border-cyan-400 transition-colors text-center">
              <span className="text-2xl">⚡</span>
              <p className="mt-2 text-sm font-semibold text-white">Book Service</p>
              <p className="text-xs text-slate-400">Electrician/Plumber</p>
            </Link>
            <Link to="/marketplace" className="rounded-2xl border border-white/10 bg-slate-950 p-4 hover:border-cyan-400 transition-colors text-center">
              <span className="text-2xl">🏷️</span>
              <p className="mt-2 text-sm font-semibold text-white">Marketplace</p>
              <p className="text-xs text-slate-400">Post Item for Sale</p>
            </Link>
            <Link to="/to-let" className="rounded-2xl border border-white/10 bg-slate-950 p-4 hover:border-cyan-400 transition-colors text-center">
              <span className="text-2xl">🔑</span>
              <p className="mt-2 text-sm font-semibold text-white">To-Let Rentals</p>
              <p className="text-xs text-slate-400">List Rental Flat</p>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Trusted Visitor & Security System</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Visitors marked as <strong>Trusted Visitor</strong> (daily maid, cook, milkman, frequent guest) bypass
            repetitive gate verification calls at the entrance.
          </p>
          <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-4 space-y-2">
            <p className="text-xs font-semibold text-cyan-300">Fast Gate Clearance Workflow:</p>
            <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Permanent resident presents token <strong>{gatePassToken}</strong> at gate terminal.</li>
              <li>New guests arrive at main gate & provide their phone number to security guard.</li>
              <li>Guard sends entry request which appears above in real-time.</li>
              <li>Once you tap <strong>Approve</strong>, the gate barrier automatically clears for entry.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ title, value, label, to, color }: { title: string; value: string | number; label: string; to: string; color: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 flex flex-col justify-between space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
        <p className="mt-2 text-2xl font-extrabold text-white font-mono">{value}</p>
      </div>
      <Link to={to} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between">
        <span>{label}</span>
        <span>→</span>
      </Link>
    </article>
  );
}
