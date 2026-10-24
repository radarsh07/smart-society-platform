import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/dashboardApi';
import type { StaffDashboardData } from '@/types/dashboard';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

export function StaffDashboardPage() {
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStaffDashboard()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
        Staff dashboard unavailable.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <TopBar title="Society Staff Workbench" subtitle="View assigned tickets, work orders, attendance logs, and work schedule." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric title="Assigned Tickets" value={data.assignedComplaints} color="amber" />
        <Metric title="Pending Work Orders" value={data.pendingTasks} color="rose" />
        <Metric title="Completed Jobs" value={data.completedTasks} color="emerald" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Work Status & Shift Info</h3>
          <div className="rounded-2xl bg-slate-950 p-4 border border-white/5 space-y-2 text-xs">
            <p><span className="text-slate-400">Attendance:</span> <span className="font-semibold text-emerald-400">{data.attendanceSummary}</span></p>
            <p><span className="text-slate-400">Schedule:</span> <span className="text-white">{data.workSchedule}</span></p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Assigned Complaints & Jobs</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Update job status to <strong>IN_PROGRESS</strong> when starting work and <strong>RESOLVED</strong> upon completion.
          </p>
          <Link to="/complaints" className="inline-block rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
            Open Work Order Queue →
          </Link>
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
