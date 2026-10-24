import { useEffect, useState } from 'react';
import { toLetApi } from '@/services/communityApi';
import type { ToLetListing, ToLetListingRequest } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

export function ToLetPage() {
  const [listings, setListings] = useState<ToLetListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  const [form, setForm] = useState<ToLetListingRequest>({
    residentId: 1,
    title: '',
    description: '',
    rent: 20000,
    location: 'Block A - Flat 402',
  });

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await toLetApi.getListings(0, 50);
      setListings(res.data?.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to load rental listings', description: 'Check backend service.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await toLetApi.createListing(form);
      pushToast({ type: 'success', title: 'To-Let Listing Published', description: form.title });
      setShowModal(false);
      setForm({ residentId: 1, title: '', description: '', rent: 20000, location: 'Block A - Flat 402' });
      loadListings();
    } catch {
      pushToast({ type: 'error', title: 'Publishing failed', description: 'Check input details.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar title="To-Let & Rental Management" subtitle="Browse available apartment flats for rent, post rental listings, and connect with flat owners." />
        <button
          onClick={() => setShowModal(true)}
          className="self-start rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition-colors sm:self-auto"
        >
          + Post Rental Listing
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : listings.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No To-Let listings available</p>
          <p className="mt-1 text-sm text-slate-500">Owners can list their flats for rent directly here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <article key={item.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-cyan-400 font-semibold">{item.location || 'Society Flat'}</span>
                  <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    AVAILABLE
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-slate-300 line-clamp-3">{item.description}</p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Monthly Rent:</span>
                  <span className="text-xl font-extrabold text-cyan-300">₹{item.rent}/mo</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-white/10">
                  <span>Owner: {item.residentName || `Resident #${item.residentId}`}</span>
                  <span className="text-emerald-400 font-medium">Verified Flat</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900 p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Post To-Let Rental Listing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Listing Title</label>
                <input
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Spacious 3BHK Semi-Furnished Flat"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.rent}
                    onChange={(e) => setForm({ ...form, rent: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Flat Location</label>
                  <input
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Tower B - 504"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Description & Amenities</label>
                <textarea
                  rows={3}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Furnishing details, deposit requirements, balcony view, parking space..."
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
                  {submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
