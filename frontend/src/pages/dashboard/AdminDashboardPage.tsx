import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/dashboardApi';
import type { AdminDashboardData } from '@/types/dashboard';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getAdminDashboard()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
        Dashboard analytics currently unavailable.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <TopBar title="Society Admin Overview" subtitle="Real-time society governance metrics, financial trends, visitor traffic, and operational status." />

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Residents" value={data.totalResidents} accent="cyan" />
        <MetricCard label="Occupied Flats" value={data.occupiedFlats} sub={`Vacant: ${data.vacantFlats}`} accent="emerald" />
        <MetricCard label="Visitors Today" value={data.visitorsToday} accent="amber" />
        <MetricCard label="Pending Complaints" value={data.pendingComplaints} sub={`Resolved: ${data.resolvedComplaints}`} accent="rose" />
        <MetricCard label="Monthly Collection" value={`₹${data.monthlyMaintenanceCollection.toLocaleString()}`} accent="emerald" />
        <MetricCard label="Pending Dues" value={`₹${data.pendingPayments.toLocaleString()}`} accent="rose" />
        <MetricCard label="Active Bookings" value={data.activeFacilityBookings} accent="cyan" />
        <MetricCard label="Service Providers" value={data.registeredServiceProviders} accent="amber" />
      </div>

      {/* Analytics Visual Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Complaint Trends Bar Chart */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-base font-bold text-white">Weekly Complaint Trends</h3>
          <div className="flex items-end gap-3 h-40 pt-4">
            {Object.entries(data.complaintTrends || {}).map(([day, val]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-mono text-cyan-300">{val}</span>
                <div
                  className="w-full rounded-t-xl bg-cyan-400/80 transition-all hover:bg-cyan-300"
                  style={{ height: `${Math.max(val * 12, 10)}px` }}
                />
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor Traffic Chart */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-base font-bold text-white">Daily Visitor Traffic</h3>
          <div className="space-y-3 pt-2">
            {Object.entries(data.visitorTraffic || {}).map(([timeSlot, count]) => (
              <div key={timeSlot} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>{timeSlot}</span>
                  <span className="text-amber-400 font-mono">{count} Visitors</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/5">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(count * 2.5, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facility Usage Distribution */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-base font-bold text-white">Facility Utilization</h3>
          <div className="space-y-3 pt-2">
            {Object.entries(data.facilityUsage || {}).map(([facility, count]) => (
              <div key={facility} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>{facility}</span>
                  <span className="text-cyan-300 font-mono">{count} Bookings</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/5">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(count * 2, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent: 'cyan' | 'emerald' | 'amber' | 'rose' }) {
  const accentStyles = {
    cyan: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5',
    emerald: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
    amber: 'border-amber-500/20 text-amber-400 bg-amber-500/5',
    rose: 'border-rose-500/20 text-rose-400 bg-rose-500/5',
  };

  return (
    <article className={`rounded-3xl border p-5 backdrop-blur-md ${accentStyles[accent]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-white font-mono">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </article>
  );
}
