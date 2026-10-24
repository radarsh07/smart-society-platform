import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { visitorApi } from '@/services';
import type { VisitorInvitationResponse } from '@/types/visitor';
import { useRole } from '@/context/RoleContext';

export function VisitorLogsPage() {
  const { role } = useRole();
  const [items, setItems] = useState<VisitorInvitationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'HISTORY'>('ALL');
  const { pushToast } = useToast();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await visitorApi.listInvitations(0, 50, 'createdAt', 'DESC');
      setItems(result.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to load visitor logs' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleApproveReject = async (id: number, approved: boolean) => {
    try {
      await visitorApi.approveInvitation(id, { passStatus: approved ? 'APPROVED' : 'REJECTED', notes: approved ? 'Resident Approved Entry' : 'Resident Rejected Entry' });
      pushToast({ type: approved ? 'success' : 'error', title: approved ? 'Visitor Approved 🟢' : 'Visitor Rejected 🔴', description: `Resident response recorded for entry pass.` });
      loadLogs();
    } catch {
      pushToast({ type: 'error', title: 'Action failed' });
    }
  };

  const handleRecordExit = async (id: number) => {
    try {
      await visitorApi.recordExit(id);
      pushToast({ type: 'success', title: 'Exit Recorded 🚪', description: 'Visitor exit timestamp logged at gate security.' });
      loadLogs();
    } catch {
      pushToast({ type: 'error', title: 'Failed to record exit' });
    }
  };

  const handleMarkAsTrusted = async (item: VisitorInvitationResponse) => {
    try {
      await visitorApi.createTrustedVisitor({
        residentId: item.residentId || 1,
        visitorName: item.visitorName,
        visitorPhone: item.visitorPhone,
        visitorCompany: item.visitorCompany || 'Frequent Visitor',
        notes: `Marked trusted by resident for Flat #${item.residentId}`,
      });
      pushToast({ type: 'success', title: 'Added to Trusted Visitors ⭐', description: `${item.visitorName} will now have instant gate entry without repeated calls.` });
    } catch {
      pushToast({ type: 'error', title: 'Failed to save trusted visitor' });
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.visitorPhone.includes(searchQuery) ||
      (item.residentName && item.residentName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterTab === 'PENDING') return item.passStatus === 'PENDING';
    if (filterTab === 'ACTIVE') return item.passStatus === 'APPROVED' || item.passStatus === 'ACTIVE';
    if (filterTab === 'HISTORY') return item.passStatus === 'USED' || item.passStatus === 'REJECTED' || item.passStatus === 'EXPIRED';
    return true;
  });

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'APPROVED':
      case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'REJECTED': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <section className="space-y-6">
      <TopBar title="Gate Entry & Visitor Pass Logs" subtitle="Track visitor invitations, resident gate approvals, active entry check-ins, trusted visitors, and exit logs." />

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
          {(['ALL', 'PENDING', 'ACTIVE', 'HISTORY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filterTab === tab ? 'bg-cyan-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Visitors' : tab === 'PENDING' ? '⏳ Pending Approval' : tab === 'ACTIVE' ? '🟢 Active / Inside' : '📋 History'}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by visitor name, phone, or resident..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredItems.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No visitor records found</p>
          <p className="mt-1 text-sm text-slate-500">Log an arriving visitor at the gate desk or invite a guest to populate logs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <article key={item.id} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 backdrop-blur-md space-y-4 hover:border-white/20 transition-all">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{item.visitorName}</h3>
                    <span className={`rounded-xl border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getBadgeClass(item.passStatus)}`}>
                      {item.passStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Phone: <span className="font-mono text-cyan-300">{item.visitorPhone}</span> • Company: <span className="text-slate-300">{item.visitorCompany || 'Personal'}</span>
                  </p>
                </div>

                <div className="text-right text-xs">
                  <p className="font-semibold text-cyan-400">Visiting: {item.residentName || `Resident #${item.residentId}`}</p>
                  <p className="text-slate-400 font-mono text-[11px] mt-0.5">Token: {item.qrCodeToken || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Purpose of Visit</span>
                  <span className="font-medium text-white">{item.purpose || 'General Visit'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Entry Timestamp</span>
                  <span className="font-mono text-emerald-300">{item.entryTime ? new Date(item.entryTime).toLocaleString() : 'Not Checked-In'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Exit Timestamp</span>
                  <span className="font-mono text-amber-300">{item.exitTime ? new Date(item.exitTime).toLocaleString() : 'Currently Active / Pending'}</span>
                </div>
              </div>

              {/* Seminar Action Buttons based on Role & Status */}
              <div className="flex flex-wrap gap-2 pt-2 justify-end">
                {/* Pending Approval Controls for Resident or Admin */}
                {item.passStatus === 'PENDING' && (role === 'RESIDENT' || role === 'ADMIN') && (
                  <>
                    <button
                      onClick={() => handleApproveReject(item.id, false)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20"
                    >
                      🔴 REJECT ENTRY
                    </button>
                    <button
                      onClick={() => handleApproveReject(item.id, true)}
                      className="rounded-xl bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-300 shadow-md"
                    >
                      🟢 APPROVE ENTRY
                    </button>
                  </>
                )}

                {/* Mark as Trusted Control for Resident or Admin */}
                {(role === 'RESIDENT' || role === 'ADMIN') && (
                  <button
                    onClick={() => handleMarkAsTrusted(item)}
                    className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20"
                  >
                    ⭐ Mark as Trusted Visitor
                  </button>
                )}

                {/* Record Exit Control for Security Guard or Admin */}
                {(item.passStatus === 'APPROVED' || item.passStatus === 'ACTIVE') && !item.exitTime && (role === 'GUARD' || role === 'ADMIN') && (
                  <button
                    onClick={() => handleRecordExit(item.id)}
                    className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 shadow-md"
                  >
                    🚪 Record Gate Exit
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
