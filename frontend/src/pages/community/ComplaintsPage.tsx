import { useEffect, useState } from 'react';
import { complaintApi, staffApi } from '@/services/communityApi';
import type { Complaint, ComplaintRequest, ComplaintPriority, Staff } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { useRole } from '@/context/RoleContext';

export function ComplaintsPage() {
  const { role, user } = useRole();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number>(0);
  const { pushToast } = useToast();

  const [form, setForm] = useState<ComplaintRequest>({
    residentId: user?.id || 1,
    categoryId: 1,
    subject: '',
    description: '',
    priority: 'MEDIUM',
    imageUrls: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const resComplaints: any = await complaintApi.getComplaints(0, 50);
      const items: Complaint[] = Array.isArray(resComplaints)
        ? resComplaints
        : Array.isArray(resComplaints?.data)
          ? resComplaints.data
          : (resComplaints?.data?.content || resComplaints?.content || []);
      setComplaints(items);
    } catch (err: any) {
      console.error('Failed to load complaints:', err);
      pushToast({ type: 'error', title: 'Failed to load complaints data' });
    } finally {
      setLoading(false);
    }

    // Only Admin and Staff need the staff list for assignment
    if (role === 'ADMIN' || role === 'STAFF') {
      try {
        const resStaff: any = await staffApi.getStaff(0, 50);
        const staff: Staff[] = Array.isArray(resStaff)
          ? resStaff
          : Array.isArray(resStaff?.data)
            ? resStaff.data
            : (resStaff?.data?.content || resStaff?.content || []);
        setStaffList(staff);
      } catch (err) {
        console.warn('Staff list could not be loaded:', err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: ComplaintRequest = {
        ...form,
        residentId: user?.id || form.residentId || 1,
      };
      await complaintApi.createComplaint(payload);
      pushToast({
        type: 'success',
        title: 'Complaint Ticket Raised',
        description: 'Ticket created successfully and queued for staff assignment.',
      });
      setShowModal(false);
      setForm({
        residentId: user?.id || 1,
        categoryId: 1,
        subject: '',
        description: '',
        priority: 'MEDIUM',
        imageUrls: [],
      });
      // Immediately reload data to show the new ticket
      await loadData();
    } catch (err: any) {
      console.error('Submission failed:', err);
      const msg = err?.response?.data?.message || 'Please check your inputs and try again.';
      pushToast({ type: 'error', title: 'Submission failed', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await complaintApi.updateStatus(id, newStatus);
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
      pushToast({ type: 'success', title: 'Ticket Status Updated', description: `Status changed to ${newStatus}` });
    } catch {
      pushToast({ type: 'error', title: 'Failed to update status' });
    }
  };

  const handleAssignStaff = async (complaintId: number) => {
    try {
      await complaintApi.assignComplaint(complaintId, selectedStaffId > 0 ? selectedStaffId : undefined);
      if (selectedStaffId === 0) {
        setComplaints(prev => prev.map(c => c.id === complaintId ? {
          ...c,
          assignedStaffId: undefined,
          assignedStaffName: undefined,
          status: 'OPEN'
        } : c));
        pushToast({ type: 'info', title: 'Ticket Unassigned', description: 'Complaint returned to Open queue.' });
      } else {
        const staffObj = staffList.find(s => s.id === selectedStaffId);
        setComplaints(prev => prev.map(c => c.id === complaintId ? {
          ...c,
          assignedStaffId: selectedStaffId,
          assignedStaffName: staffObj ? `${staffObj.fullName} (${staffObj.specialization || 'Staff'})` : 'Assigned Technician',
          status: 'IN_PROGRESS'
        } : c));
        pushToast({ type: 'success', title: 'Staff Technician Assigned 👷', description: 'Technician updated and status set to IN_PROGRESS.' });
      }
      setAssigningId(null);
    } catch {
      pushToast({ type: 'error', title: 'Assignment failed' });
    }
  };

  const getPriorityBadge = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'URGENT': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'MEDIUM': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'LOW': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'PENDING': return 'bg-amber-400/10 text-amber-300 border-amber-400/20';
      case 'IN_PROGRESS': return 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20';
      case 'RESOLVED': return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20';
      case 'CLOSED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-400/10 text-slate-300 border-slate-400/20';
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar
          title={role === 'RESIDENT' ? 'My Complaints & Issues' : 'Complaint Management Queue'}
          subtitle="Issue tracking, priority classification, society staff assignment, and lifecycle resolution status."
        />
        {(role === 'RESIDENT' || role === 'ADMIN') && (
          <button
            onClick={() => setShowModal(true)}
            className="self-start rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition-all shadow-lg hover:shadow-cyan-500/20 sm:self-auto text-xs"
          >
            + Raise Complaint Ticket
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : complaints.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No complaints found</p>
          <p className="mt-1 text-sm text-slate-500">Raise a new complaint ticket to start tracking issues.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {complaints.map((item) => (
            <article key={item.id} className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-cyan-400">{item.ticketNumber || `CMP-#${item.id}`}</span>
                  <span className={`rounded-xl border px-2.5 py-1 text-xs font-medium ${getPriorityBadge(item.priority)}`}>
                    Priority: {item.priority}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{item.subject}</h3>
                <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">{item.description}</p>
                
                <div className="pt-1 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-300 border border-white/5">
                    Category: {item.categoryName || 'General Maintenance'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 space-y-3 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Resident:</span>
                  <span className="font-medium text-slate-200">{item.residentName || `Resident #${item.residentId}`}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Assigned Staff:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-cyan-300">{item.assignedStaffName || 'Unassigned (Open Queue)'}</span>
                    {item.assignedStaffName && (
                      <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                        Assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Society Admin Staff Assignment & Reassignment Controls */}
                {role === 'ADMIN' && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    {assigningId === item.id ? (
                      <div className="flex gap-2 items-center">
                        <select
                          className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none"
                          value={selectedStaffId}
                          onChange={(e) => setSelectedStaffId(Number(e.target.value))}
                        >
                          <option value={0}>-- Unassigned (Open Queue) --</option>
                          {staffList.map(staff => (
                            <option key={staff.id} value={staff.id}>
                              {staff.fullName} ({staff.specialization || 'General'}) {staff.workStatus && staff.workStatus !== 'AVAILABLE' ? `[${staff.workStatus}]` : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignStaff(item.id)}
                          className="rounded-xl bg-purple-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-400"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setAssigningId(null)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAssigningId(item.id); setSelectedStaffId(item.assignedStaffId || 0); }}
                        className="w-full rounded-xl border border-purple-500/30 bg-purple-500/10 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/20"
                      >
                        {item.assignedStaffName ? '🔄 Reassign / Change Technician' : '👷 Assign Society Staff Technician'}
                      </button>
                    )}
                  </div>
                )}

                {/* Status Workflow Selector for Staff / Admin / Resident */}
                <div className="flex justify-between items-center pt-2">
                  <span>Status:</span>
                  {role === 'ADMIN' || role === 'STAFF' ? (
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`rounded-xl border px-3 py-1 text-xs font-semibold outline-none cursor-pointer bg-slate-950 ${getStatusBadge(item.status)}`}
                    >
                      <option value="OPEN">OPEN / PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  ) : (
                    <span className={`rounded-xl border px-3 py-1 text-xs font-semibold ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Raise Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2rem] border border-cyan-500/30 bg-slate-900 p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📝</span> Raise Complaint Ticket
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Subject</label>
                <input
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Water Leakage in Flat A-302 Sink"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the complaint issue in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs uppercase tracking-wider text-slate-400">Priority</label>
                    <span className="text-[10px] font-medium text-cyan-400">🤖 Auto-Analyzed</span>
                  </div>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as ComplaintPriority })}
                  >
                    <option value="MEDIUM">Auto (Recommended)</option>
                    <option value="LOW">LOW (Cosmetic / Minor)</option>
                    <option value="MEDIUM">MEDIUM (General)</option>
                    <option value="HIGH">HIGH (Water / Power / Lift)</option>
                    <option value="URGENT">URGENT (Fire / Hazard / Safety)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Category</label>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                  >
                    <option value={1}>Plumbing Services</option>
                    <option value={2}>Electrical Maintenance</option>
                    <option value={3}>Elevator / Lift</option>
                    <option value={4}>Cleanliness & Waste</option>
                    <option value={5}>Security & Access</option>
                    <option value={6}>General Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold text-slate-300 hover:bg-white/10 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-cyan-400 py-3 font-bold text-slate-950 hover:bg-cyan-300 text-sm shadow-md"
                >
                  {submitting ? 'Creating Ticket...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
