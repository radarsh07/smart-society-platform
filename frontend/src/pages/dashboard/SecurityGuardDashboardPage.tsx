import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/dashboardApi';
import type { GuardDashboardData } from '@/types/dashboard';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

export function SecurityGuardDashboardPage() {
  const [data, setData] = useState<GuardDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getGuardDashboard()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
        Security dashboard unavailable.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <TopBar title="Main Gate Security Dashboard" subtitle="Visitor verification, gate entry/exit logging, trusted visitor lookup, and parcel reception desk." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Waiting Approval" value={data.visitorsWaitingApproval} color="amber" />
        <Metric title="Today's Entries" value={data.todayEntries} color="emerald" />
        <Metric title="Today's Exits" value={data.todayExits} color="cyan" />
        <Metric title="Pending Parcels" value={data.pendingParcels} color="rose" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Gate Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link to="/visitors/entry" className="rounded-2xl bg-cyan-400 p-4 font-semibold text-slate-950 text-center hover:bg-cyan-300 transition-colors">
              + New Visitor Gate Check-in
            </Link>
            <Link to="/visitors/logs" className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-slate-200 text-center hover:bg-white/5 transition-colors">
              🔍 Search Trusted Visitor / Pass QR
            </Link>
            <Link to="/parcels" className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-slate-200 text-center hover:bg-white/5 transition-colors">
              📦 Log Incoming Courier / Parcel
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Security Verification Rules</h3>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
            <li><strong>Trusted Visitors:</strong> Verify phone number & photo. No OTP or resident approval needed.</li>
            <li><strong>Registered Service Providers:</strong> Check allowed time slot (e.g. Cook 07:00-10:00).</li>
            <li><strong>First-time Visitors:</strong> Trigger resident mobile app push approval before opening gate barrier.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Metric({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-white font-mono">{value}</p>
    </article>
  );
}
