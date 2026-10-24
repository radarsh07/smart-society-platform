import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/dashboardApi';
import type { AuditLogItem } from '@/types/dashboard';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function AuditViewerPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getAuditLogs(filterUser || undefined, filterAction || undefined);
      setLogs(res.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <section className="space-y-6">
      <TopBar title="System Audit & Security Logs" subtitle="Immutable audit trail of authentication events, gate entries, document requests, and payment transactions." />

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-4">
        <input
          placeholder="Filter by Username..."
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
        <input
          placeholder="Filter by Action (e.g. LOGIN, CREATE)..."
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        />
        <button
          onClick={loadLogs}
          className="rounded-2xl bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
        >
          Apply Filters
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950/80 uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {logs.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-400">{item.timestamp}</td>
                    <td className="px-6 py-4 font-semibold text-white">{item.username}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-medium text-cyan-300">
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-300">{item.action}</td>
                    <td className="px-6 py-4">{item.entityName} #{item.entityId}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{item.ipAddress}</td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
