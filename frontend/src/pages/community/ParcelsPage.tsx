import { useEffect, useState } from 'react';
import { parcelApi } from '@/services/communityApi';
import type { Parcel, ParcelRequest } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

export function ParcelsPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  const [form, setForm] = useState<ParcelRequest>({
    residentId: 1,
    trackingNumber: '',
    courierName: 'Amazon',
    description: '',
    status: 'ARRIVED',
  });

  const loadParcels = async () => {
    setLoading(true);
    try {
      const res = await parcelApi.getParcels(0, 50);
      setParcels(res.data?.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to load parcels', description: 'Backend service error.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParcels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await parcelApi.createParcel(form);
      pushToast({ type: 'success', title: 'Parcel Logged', description: `Tracking #${form.trackingNumber}` });
      setShowModal(false);
      setForm({ residentId: 1, trackingNumber: '', courierName: 'Amazon', description: '', status: 'ARRIVED' });
      loadParcels();
    } catch {
      pushToast({ type: 'error', title: 'Parcel log failed', description: 'Invalid tracking info or resident ID.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COLLECTED': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'NOTIFIED': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'ARRIVED': default: return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar title="Smart Parcel & Courier Management" subtitle="Log incoming courier deliveries at main gate, notify residents, and track collection OTPs." />
        <button
          onClick={() => setShowModal(true)}
          className="self-start rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition-colors sm:self-auto"
        >
          + Register Incoming Parcel
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : parcels.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No parcels logged at security desk</p>
          <p className="mt-1 text-sm text-slate-500">Security guards can log incoming Amazon, Flipkart, or BlueDart deliveries.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {parcels.map((p) => (
            <article key={p.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-cyan-400">{p.courierName}</span>
                  <span className={`rounded-xl border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(p.status)}`}>
                    {p.status || 'ARRIVED'}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">Tracking Number</p>
                  <p className="text-base font-bold text-white font-mono">{p.trackingNumber || 'TRK-N/A'}</p>
                </div>
                {p.description && <p className="text-xs text-slate-300">{p.description}</p>}
              </div>

              <div className="pt-3 border-t border-white/10 text-xs text-slate-400 space-y-1">
                <p className="flex justify-between">
                  <span>Resident:</span>
                  <span className="text-slate-200 font-medium">{p.residentName || `Resident #${p.residentId}`}</span>
                </p>
                <p className="flex justify-between">
                  <span>Logged Time:</span>
                  <span>{p.receivedAt ? new Date(p.receivedAt).toLocaleTimeString() : 'Just now'}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900 p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Log Incoming Parcel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Courier Partner / Company</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.courierName}
                  onChange={(e) => setForm({ ...form, courierName: e.target.value })}
                >
                  <option value="Amazon">Amazon Logistics</option>
                  <option value="Flipkart">Flipkart Ekart</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="DTDC">DTDC Courier</option>
                  <option value="FedEx">FedEx / Delhivery</option>
                  <option value="Zomato / Swiggy">Food Delivery (Zomato/Swiggy)</option>
                  <option value="Other">Other Courier</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Tracking Number</label>
                  <input
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white font-mono outline-none focus:border-cyan-400"
                    value={form.trackingNumber}
                    onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
                    placeholder="TRK-98765432"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Target Resident ID</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.residentId}
                    onChange={(e) => setForm({ ...form, residentId: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Parcel Description (Optional)</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Medium cardboard box, fragile sticker..."
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
                  {submitting ? 'Logging...' : 'Log & Notify Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
