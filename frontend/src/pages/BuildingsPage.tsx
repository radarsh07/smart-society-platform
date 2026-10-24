import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildingApi, societyApi } from '@/services';
import type { BuildingRequest, BuildingResponse, SocietyResponse } from '@/types/society';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/hooks/useToast';

const emptyForm: BuildingRequest = { societyId: 0, buildingName: '', buildingCode: '', totalFloors: 1 };

export function BuildingsPage() {
  const [society, setSociety] = useState<SocietyResponse | null>(null);
  const [form, setForm] = useState<BuildingRequest>(emptyForm);
  const [items, setItems] = useState<BuildingResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    societyApi.getCurrentSociety()
      .then(societyData => {
        setSociety(societyData);
        if (societyData) {
          setForm(current => ({ ...current, societyId: societyData.id }));
        }
      })
      .catch(() => setSociety(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!society?.id) return;
    buildingApi.listBuildings(society.id, page, 10)
      .then(result => {
        setItems(result.content);
        setTotalPages(result.totalPages);
      })
      .catch(() => pushToast({ type: 'error', title: 'Failed to load buildings' }));
  }, [society, page, pushToast]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!society?.id) {
      pushToast({
        type: 'error',
        title: 'No Society Found',
        description: 'Please create a Society in the Society master page before adding buildings.'
      });
      return;
    }

    if (!form.buildingName.trim()) {
      pushToast({
        type: 'error',
        title: 'Validation Error',
        description: 'Building name is required.'
      });
      return;
    }

    setSaving(true);
    try {
      const payload: BuildingRequest = {
        societyId: society.id,
        buildingName: form.buildingName.trim(),
        buildingCode: form.buildingCode?.trim() ? form.buildingCode.trim().toUpperCase() : undefined,
        totalFloors: Number(form.totalFloors) || 1,
      };

      const created = await buildingApi.createBuilding(payload);
      pushToast({
        type: 'success',
        title: 'Building saved successfully',
        description: `${created.buildingName} (Code: ${created.buildingCode}) added to ${society.societyName}`
      });

      setForm({ ...emptyForm, societyId: society.id });

      const result = await buildingApi.listBuildings(society.id, page, 10);
      setItems(result.content);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      const description = err?.response?.data?.message || err?.message || 'Check building name and code.';
      pushToast({ type: 'error', title: 'Save failed', description });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <TopBar title="Buildings & Towers" subtitle="Manage wings, blocks, and towers linked to your society in MySQL." />

      {loading ? <LoadingSpinner /> : null}

      {/* Society Context Banner */}
      {!loading && society ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-3xl p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">🏛️</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Target Society
                </span>
                <span className="text-xs text-slate-400">ID #{society.id}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{society.societyName}</h2>
              <p className="text-xs text-slate-400">
                {society.addressLine1}, {society.city}, {society.state} {society.pincode}
                {society.registrationNumber ? ` • Reg: ${society.registrationNumber}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/society"
              className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              Edit Society ⚙️
            </Link>
          </div>
        </div>
      ) : !loading ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-200">
          <div className="flex items-center gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-sm text-amber-100">No Society Master Configured Yet</h3>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Before creating buildings or towers, you must first create your Society master profile so all buildings are stored under it.
              </p>
            </div>
          </div>
          <Link
            to="/society"
            className="rounded-2xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs font-bold text-slate-950 transition whitespace-nowrap shadow-lg shadow-amber-500/20"
          >
            Create Society Master ➡️
          </Link>
        </div>
      ) : null}

      {/* Building Creation Form */}
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-3">
        <div className="md:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            ➕ Add Building / Wing / Tower
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {society ? (
              <>Saving building directly under <span className="font-semibold text-cyan-300">{society.societyName}</span>.</>
            ) : (
              <span className="text-amber-300">Please create a Society first before submitting this form.</span>
            )}
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-1">
          <span>Building Name *</span>
          <input
            required
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400 transition"
            placeholder="e.g. Tower A (Alpha)"
            value={form.buildingName}
            onChange={event => setForm(current => ({ ...current, buildingName: event.target.value }))}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-1">
          <div className="flex items-center justify-between">
            <span>Building Code</span>
            <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              🎲 Auto-Generated Unique
            </span>
          </div>
          <input
            disabled
            className="rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-cyan-300 outline-none placeholder:text-slate-500 cursor-not-allowed font-mono text-sm"
            placeholder="⚡ Generated on Save (e.g. BLD-4821)"
            value={form.buildingCode || ''}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-1">
          <span>Total Floors *</span>
          <input
            required
            min={1}
            max={200}
            type="number"
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400 transition"
            placeholder="e.g. 14"
            value={form.totalFloors || ''}
            onChange={event => setForm(current => ({ ...current, totalFloors: Number(event.target.value) }))}
          />
        </label>

        <div className="md:col-span-3 flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !society}
            className="rounded-2xl bg-cyan-400 hover:bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
          >
            {saving ? 'Saving Building...' : society ? `Save Building to ${society.societyName}` : 'Create Society First'}
          </button>
        </div>
      </form>

      {/* Buildings Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Existing Buildings {items.length > 0 ? `(${items.length})` : ''}
        </h3>

        {items.length === 0 && !loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 text-center text-slate-500">
            <span className="text-4xl block mb-2 opacity-50">🏢</span>
            <p className="font-semibold text-sm text-slate-300">No buildings registered yet</p>
            <p className="text-xs mt-1">Use the form above to add your society's first building or wing.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map(building => (
              <article key={building.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md hover:border-white/20 transition group">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    {building.buildingCode}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ID #{building.id}
                  </span>
                </div>
                <h4 className="mt-3 text-xl font-bold text-white group-hover:text-cyan-300 transition">
                  {building.buildingName}
                </h4>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                  <span>🏢 {building.totalFloors} Floors</span>
                  <span className="text-cyan-400/90 font-medium truncate max-w-[180px]">
                    🏛️ {building.societyName || society?.societyName || 'Society'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          pageNumber={page}
          totalPages={totalPages}
          onPrevious={() => setPage(current => Math.max(0, current - 1))}
          onNext={() => setPage(current => current + 1)}
        />
      )}
    </section>
  );
}