import { useEffect, useState } from 'react';
import { marketplaceApi } from '@/services/communityApi';
import type { MarketplaceItem, MarketplaceItemRequest } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

export function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  const [form, setForm] = useState<MarketplaceItemRequest>({
    residentId: 1,
    title: '',
    description: '',
    price: 0,
    category: 'Electronics',
  });

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await marketplaceApi.getItems(0, 50);
      setItems(res.data?.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to load marketplace', description: 'Check backend service.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await marketplaceApi.createItem(form);
      pushToast({ type: 'success', title: 'Listing Posted', description: form.title });
      setShowModal(false);
      setForm({ residentId: 1, title: '', description: '', price: 0, category: 'Electronics' });
      loadItems();
    } catch {
      pushToast({ type: 'error', title: 'Post failed', description: 'Could not create marketplace listing.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar title="Community Marketplace" subtitle="Buy and sell pre-owned household goods, electronics, and furniture securely within your society." />
        <button
          onClick={() => setShowModal(true)}
          className="self-start rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition-colors sm:self-auto"
        >
          + Post Item for Sale
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-400">
          <p className="text-lg font-medium">No marketplace items listed yet</p>
          <p className="mt-1 text-sm text-slate-500">Post an item for sale to share with society neighbors.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-300">
                    {item.category || 'General'}
                  </span>
                  <span className="text-xl font-extrabold text-white">₹{item.price}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-slate-300 line-clamp-3">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
                <span>Seller: {item.residentName || `Resident #${item.residentId}`}</span>
                <span className="rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-1">AVAILABLE</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900 p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Post Item for Sale</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Item Title</label>
                <input
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Wooden Dining Table (6-Seater)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Category</label>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Vehicles">Vehicles & Bikes</option>
                    <option value="Books & Toys">Books & Toys</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Item Description</label>
                <textarea
                  rows={3}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe condition, age, usage history, and reason for selling..."
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
                  {submitting ? 'Posting...' : 'Post Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
