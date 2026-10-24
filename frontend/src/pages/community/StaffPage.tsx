import { useEffect, useState } from 'react';
import { staffApi } from '@/services/communityApi';
import type { Staff } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

export function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  const [form, setForm] = useState({
    fullName: '',
    specialization: 'Electrician',
    phoneNumber: '',
    email: '',
    workStatus: 'AVAILABLE',
  });

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await staffApi.getStaff(0, 50);
      setStaffList(res.data?.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to load staff list', description: 'Check connection.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await staffApi.createStaff(form);
      pushToast({ type: 'success', title: 'Staff Added', description: form.fullName });
      setShowModal(false);
      setForm({ fullName: '', specialization: 'Electrician', phoneNumber: '', email: '', workStatus: 'AVAILABLE' });
      loadStaff();
    } catch {
      pushToast({ type: 'error', title: 'Action failed', description: 'Could not register staff member.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar title="Society Staff Management" subtitle="Manage electricians, plumbers, cleaners, gardeners, and track work availability." />
        <button
          onClick={() => setShowModal(true)}
          className="self-start rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition-colors sm:self-auto"
        >
          + Add Staff Member
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : staffList.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No staff members registered</p>
          <p className="mt-1 text-sm text-slate-500">Click Add Staff Member to register plumbers, electricians, or cleaners.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffList.map((staff) => (
            <article key={staff.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold text-lg">
                  {staff.fullName.charAt(0)}
                </div>
                <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  {staff.workStatus || 'ACTIVE'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">{staff.fullName}</h3>
                <p className="text-sm font-medium text-cyan-400">{staff.specialization}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-white/10">
                <p className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono">{staff.phoneNumber}</span>
                </p>
                {staff.email && (
                  <p className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span>{staff.email}</span>
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900 p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Register Staff Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                <input
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Specialization</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Gardener">Gardener</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Security">Security Supervisor</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                  <input
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Work Status</label>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.workStatus}
                    onChange={(e) => setForm({ ...form, workStatus: e.target.value })}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ON_JOB">ON JOB</option>
                    <option value="OFF_DUTY">OFF DUTY</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="rajesh@society.org"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-cyan-400 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  {submitting ? 'Saving...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
