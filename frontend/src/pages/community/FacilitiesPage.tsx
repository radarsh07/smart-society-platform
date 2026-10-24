import { useEffect, useState } from 'react';
import { facilityApi } from '@/services/communityApi';
import type { FacilityBooking, FacilityBookingRequest } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

const PREDEFINED_FACILITIES = [
  { id: 1, name: 'Clubhouse', capacity: 100, fee: 1000, desc: 'Air-conditioned hall with audio system & party seating.' },
  { id: 2, name: 'Swimming Pool', capacity: 25, fee: 200, desc: 'Olympic-size pool with safety guard & sun loungers.' },
  { id: 3, name: 'Community Gymnasium', capacity: 30, fee: 0, desc: 'Fully equipped weights & cardio fitness station.' },
  { id: 4, name: 'Tennis & Badminton Court', capacity: 10, fee: 150, desc: 'Synthetic synthetic turf court with night floodlights.' },
];

export function FacilitiesPage() {
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  const [form, setForm] = useState<FacilityBookingRequest>({
    facilityId: 1,
    residentId: 1,
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7200000).toISOString().slice(0, 16),
    notes: '',
  });

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await facilityApi.getBookings(0, 50);
      setBookings(res.data?.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to load bookings', description: 'Backend service unreachable.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await facilityApi.createBooking(form);
      pushToast({ type: 'success', title: 'Facility Reserved', description: 'Booking requested successfully.' });
      setShowModal(false);
      loadBookings();
    } catch {
      pushToast({ type: 'error', title: 'Booking failed', description: 'Time conflict or missing facility ID.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar title="Facility Booking & Amenities" subtitle="Reserve society facilities like Clubhouse, Gym, Pool, and Community Hall with slot conflict prevention." />
        <button
          onClick={() => setShowModal(true)}
          className="self-start rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition-colors sm:self-auto"
        >
          + Book Facility Slot
        </button>
      </div>

      {/* Facilities Catalog */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PREDEFINED_FACILITIES.map((fac) => (
          <article key={fac.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">{fac.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{fac.desc}</p>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
              <span className="text-slate-400">Capacity: {fac.capacity}</span>
              <span className="font-bold text-cyan-300">{fac.fee === 0 ? 'Free' : `₹${fac.fee}/hr`}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Booking History */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-white">Current Reservations</h2>

        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-400">
            No facility bookings recorded.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((b) => (
              <article key={b.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-base">{b.facilityName || `Facility #${b.facilityId}`}</h4>
                  <span className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                    {b.status || 'APPROVED'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">Booked by: {b.residentName || `Resident #${b.residentId}`}</p>
                <div className="rounded-2xl bg-slate-950 p-3 text-xs font-mono text-slate-400 space-y-1">
                  <p>Start: {b.startTime ? new Date(b.startTime).toLocaleString() : 'N/A'}</p>
                  <p>End: {b.endTime ? new Date(b.endTime).toLocaleString() : 'N/A'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900 p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Book Facility Slot</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Select Facility</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.facilityId}
                  onChange={(e) => setForm({ ...form, facilityId: Number(e.target.value) })}
                >
                  {PREDEFINED_FACILITIES.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.fee === 0 ? 'Free' : `₹${f.fee}/hr`})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Event / Booking Notes</label>
                <textarea
                  rows={2}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Birthday party, tournament, or family gathering..."
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
                  {submitting ? 'Confirming...' : 'Reserve Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
