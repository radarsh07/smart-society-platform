import { useEffect, useState } from 'react';
import { serviceBookingApi } from '@/services/communityApi';
import type { ServiceBooking, ServiceBookingRequest } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

const POPULAR_SERVICES = [
  { type: 'Electrician', icon: '⚡', desc: 'Wiring, switch repairs, appliance fitting & light installations.' },
  { type: 'Plumber', icon: '🔧', desc: 'Pipe leakages, tap repairs, bathroom fitting & drainage cleaning.' },
  { type: 'Deep Cleaning', icon: '🧹', desc: 'Full flat deep sanitization, sofa & carpet shampoo cleaning.' },
  { type: 'AC Service & Repair', icon: '❄️', desc: 'Air conditioner gas refill, filter cleaning & cooling maintenance.' },
  { type: 'Car Wash', icon: '🚗', desc: 'Doorstep exterior eco-wash & interior vacuuming.' },
  { type: 'Laundry & Dry Clean', icon: '👕', desc: 'Clothes wash, steam iron, and dry cleaning door pickup.' },
];

export function ServicesPage() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  const [form, setForm] = useState<ServiceBookingRequest>({
    residentId: 1,
    serviceType: 'Electrician',
    description: '',
    preferredTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await serviceBookingApi.getBookings(0, 50);
      setBookings(res.data?.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to load service bookings', description: 'Check backend API.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await serviceBookingApi.createBooking(form);
      pushToast({ type: 'success', title: 'Service Booked', description: `Requested ${form.serviceType} service.` });
      setShowModal(false);
      loadBookings();
    } catch {
      pushToast({ type: 'error', title: 'Booking failed', description: 'Could not book service.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar title="Household Service Booking" subtitle="Book verified society electricians, plumbers, cleaning experts, and technicians at your doorstep." />
        <button
          onClick={() => setShowModal(true)}
          className="self-start rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition-colors sm:self-auto"
        >
          + Book Household Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {POPULAR_SERVICES.map((s) => (
          <article
            key={s.type}
            onClick={() => {
              setForm((prev) => ({ ...prev, serviceType: s.type }));
              setShowModal(true);
            }}
            className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md hover:border-cyan-400/50 cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{s.icon}</span>
              <h3 className="text-lg font-bold text-white">{s.type}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            <div className="pt-2 flex justify-end">
              <span className="text-xs font-semibold text-cyan-400">Book Now →</span>
            </div>
          </article>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-white">Your Service Requests</h2>

        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-400">
            No active household service bookings.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((b) => (
              <article key={b.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-base">{b.serviceType}</h4>
                  <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                    {b.status || 'SCHEDULED'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{b.description || 'Routine service request'}</p>
                <div className="text-xs text-slate-400 font-mono pt-2 border-t border-white/10 flex justify-between">
                  <span>Preferred Time:</span>
                  <span>{b.preferredTime ? new Date(b.preferredTime).toLocaleString() : 'Asap'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900 p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Book Household Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Service Type</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                >
                  {POPULAR_SERVICES.map((s) => (
                    <option key={s.type} value={s.type}>{s.type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Problem Description</label>
                <textarea
                  rows={3}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Explain work required (e.g. Master bedroom ceiling fan speed regulator replacement)..."
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
                  {submitting ? 'Booking...' : 'Confirm Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
