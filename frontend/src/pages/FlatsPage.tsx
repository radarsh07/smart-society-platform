import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildingApi, flatApi, societyApi } from '@/services';
import type {
  BuildingResponse,
  FlatRequest,
  FlatResponse,
  FlatSearchRequest,
  SocietyResponse,
} from '@/types/society';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/hooks/useToast';
import { useRole } from '@/context/RoleContext';

const standardFlatTypes = [
  '1 BHK',
  '1.5 BHK',
  '2 BHK',
  '2.5 BHK',
  '3 BHK',
  '3.5 BHK',
  '4 BHK',
  'Penthouse',
  'Studio',
  'Duplex',
  'Commercial / Shop',
];

const emptyFlatForm: FlatRequest = {
  buildingId: 0,
  flatNumber: '',
  flatType: '2 BHK',
  floorNumber: 1,
  carpetArea: undefined,
  status: 'VACANT',
};

const defaultSearch: FlatSearchRequest = {
  page: 0,
  size: 12,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};

export function FlatsPage() {
  const { role } = useRole();
  const isAdmin = role === 'ADMIN';

  const [society, setSociety] = useState<SocietyResponse | null>(null);
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | 'ALL'>('ALL');
  
  // Flat creation form state
  const [form, setForm] = useState<FlatRequest>(emptyFlatForm);
  const [showAddForm, setShowAddForm] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Search & List state
  const [search, setSearch] = useState<FlatSearchRequest>(defaultSearch);
  const [items, setItems] = useState<FlatResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingFlats, setLoadingFlats] = useState(false);

  const { pushToast } = useToast();

  // 1. Load active Society and all its buildings
  useEffect(() => {
    async function loadMasterData() {
      setLoading(true);
      try {
        const societyData = await societyApi.getCurrentSociety();
        setSociety(societyData);

        if (societyData?.id) {
          const buildingsRes = await buildingApi.listBuildings(societyData.id, 0, 100);
          const bList = buildingsRes.content || [];
          setBuildings(bList);

          // If buildings exist, default form building to the first building
          if (bList.length > 0) {
            setForm(current => ({
              ...current,
              buildingId: bList[0].id,
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching society or buildings', err);
      } finally {
        setLoading(false);
      }
    }

    loadMasterData();
  }, []);

  // 2. Fetch flats based on filters and selected building
  useEffect(() => {
    setLoadingFlats(true);
    const filterParams: FlatSearchRequest = {
      ...search,
      page,
      buildingId: selectedBuildingId !== 'ALL' ? selectedBuildingId : undefined,
    };

    flatApi.listFlats(filterParams)
      .then(result => {
        setItems(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      })
      .catch(() => pushToast({ type: 'error', title: 'Failed to load flats' }))
      .finally(() => setLoadingFlats(false));
  }, [page, search, selectedBuildingId, pushToast]);

  // Handle changing the building in the Add Flat form
  const activeFormBuilding = buildings.find(b => b.id === Number(form.buildingId));

  async function handleCreateFlat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!society?.id) {
      pushToast({
        type: 'error',
        title: 'No Society Found',
        description: 'Please set up a society first.',
      });
      return;
    }

    if (!form.buildingId || form.buildingId === 0) {
      pushToast({
        type: 'error',
        title: 'Building Required',
        description: 'Please select which building of the society this flat belongs to.',
      });
      return;
    }

    if (!form.flatNumber.trim()) {
      pushToast({
        type: 'error',
        title: 'Flat Number Required',
        description: 'Please enter a valid flat number (e.g. 101, A-202).',
      });
      return;
    }

    if (form.floorNumber === undefined || form.floorNumber === null) {
      pushToast({
        type: 'error',
        title: 'Floor Number Required',
        description: 'Please enter the floor number.',
      });
      return;
    }

    setSaving(true);
    try {
      const payload: FlatRequest = {
        buildingId: Number(form.buildingId),
        flatNumber: form.flatNumber.trim().toUpperCase(),
        flatType: form.flatType.trim(),
        floorNumber: Number(form.floorNumber),
        carpetArea: form.carpetArea ? Number(form.carpetArea) : undefined,
        status: form.status,
      };

      const created = await flatApi.createFlat(payload);
      pushToast({
        type: 'success',
        title: 'Flat Saved Successfully',
        description: `Flat ${created.flatNumber} (${created.flatType}) registered under building ${created.buildingName}.`,
      });

      // Clear flat number and keep current building for rapid entry of next flat
      setForm(curr => ({
        ...curr,
        flatNumber: '',
        floorNumber: curr.floorNumber,
      }));

      // Reload flats list
      const filterParams: FlatSearchRequest = {
        ...search,
        page,
        buildingId: selectedBuildingId !== 'ALL' ? selectedBuildingId : undefined,
      };
      const result = await flatApi.listFlats(filterParams);
      setItems(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err: any) {
      const description = err?.response?.data?.message || err?.message || 'Check flat details and uniqueness.';
      pushToast({ type: 'error', title: 'Save Failed', description });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFlat(flatId: number, flatNum: string, buildingName: string) {
    if (!window.confirm(`Are you sure you want to delete Flat ${flatNum} from ${buildingName}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(flatId);
    try {
      await flatApi.deleteFlat(flatId);
      pushToast({
        type: 'success',
        title: 'Flat Deleted',
        description: `Flat ${flatNum} in ${buildingName} has been deleted.`,
      });

      // Refresh list
      const filterParams: FlatSearchRequest = {
        ...search,
        page,
        buildingId: selectedBuildingId !== 'ALL' ? selectedBuildingId : undefined,
      };
      const result = await flatApi.listFlats(filterParams);
      setItems(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err: any) {
      const description = err?.response?.data?.message || err?.message || 'Failed to delete flat.';
      pushToast({ type: 'error', title: 'Delete Failed', description });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <TopBar
        title="Flat & Unit Management"
        subtitle="Manage apartments, penthouses, and units linked to specific buildings of your society."
      />

      {loading ? <LoadingSpinner /> : null}

      {/* Society & Building Context Banner */}
      {!loading && society && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950/80 p-6 backdrop-blur-md">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-2xl shadow-lg shadow-cyan-500/10">
              🏛️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  Target Society
                </span>
                <span className="text-xs text-slate-400">Society ID #{society.id}</span>
                {society.registrationNumber && (
                  <span className="text-xs text-slate-400 font-mono">Reg: {society.registrationNumber}</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{society.societyName}</h2>
              <p className="text-xs text-slate-400">
                {society.addressLine1}, {society.city}, {society.state} {society.pincode}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/buildings"
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20"
            >
              🏢 Manage Buildings ({buildings.length})
            </Link>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowAddForm(prev => !prev)}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-all hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
              >
                {showAddForm ? '✕ Close Flat Form' : '➕ Add Flat Entry'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Warning if no buildings are present */}
      {!loading && society && buildings.length === 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-950/20 p-6 text-center">
          <div className="text-3xl mb-2">🏢⚠️</div>
          <h3 className="text-lg font-bold text-white">No Buildings Found in {society.societyName}</h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto mt-1 mb-4">
            Before adding flats, you need to create at least one building or wing (e.g. Tower A, Block B) for this society in MySQL.
          </p>
          <Link
            to="/buildings"
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-amber-300"
          >
            🏢 Create First Building Now
          </Link>
        </div>
      )}

      {/* Add Flat to Building Section (Admin Only) */}
      {!loading && isAdmin && buildings.length > 0 && showAddForm && (
        <div className="rounded-[2rem] border border-cyan-500/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                🏢 Add Flat to Building
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Register New Flat Entry</h3>
              <p className="text-xs text-slate-400">
                Choose the exact building of {society?.societyName || 'the society'} to record the unit permanently in MySQL.
              </p>
            </div>

            {activeFormBuilding && (
              <div className="flex items-center gap-3 bg-cyan-950/30 border border-cyan-500/20 px-4 py-2 rounded-2xl">
                <span className="text-2xl">🏢</span>
                <div className="text-left">
                  <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Selected Building</div>
                  <div className="text-sm font-bold text-white">{activeFormBuilding.buildingName} ({activeFormBuilding.buildingCode})</div>
                  <div className="text-[11px] text-slate-400">Total Floors: {activeFormBuilding.totalFloors}</div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleCreateFlat} className="mt-6 grid gap-5 md:grid-cols-3">
            {/* 1. Target Building Dropdown */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>1. Target Building *</span>
                <span className="text-[10px] text-cyan-400 font-normal">Choose Building</span>
              </label>
              <select
                className="w-full rounded-2xl border border-cyan-500/30 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                value={form.buildingId}
                onChange={e => {
                  const bId = Number(e.target.value);
                  setForm(curr => ({ ...curr, buildingId: bId }));
                }}
                required
              >
                <option value={0} disabled>-- Select Building of Society --</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>
                    🏢 {b.buildingName} ({b.buildingCode}) • {b.totalFloors} Floors
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                This flat will strictly belong to the chosen building.
              </p>
            </div>

            {/* 2. Flat Number */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Flat / Unit Number *
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors uppercase"
                placeholder="e.g. 101, 204, A-302"
                value={form.flatNumber}
                onChange={e => setForm(curr => ({ ...curr, flatNumber: e.target.value }))}
                required
              />
              <p className="text-[11px] text-slate-400">
                Unique identifier inside this building.
              </p>
            </div>

            {/* 3. Flat Type */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Flat Type *
              </label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                value={form.flatType}
                onChange={e => setForm(curr => ({ ...curr, flatType: e.target.value }))}
                required
              >
                {standardFlatTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Configuration / floor plan layout.
              </p>
            </div>

            {/* 4. Floor Number */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>4. Floor Number *</span>
                {activeFormBuilding && (
                  <span className="text-[10px] text-slate-400">Max: {activeFormBuilding.totalFloors}</span>
                )}
              </label>
              <input
                type="number"
                min={0}
                max={activeFormBuilding?.totalFloors || 100}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="Floor (e.g. 1, 2, 3)"
                value={form.floorNumber ?? ''}
                onChange={e => setForm(curr => ({ ...curr, floorNumber: e.target.value === '' ? 0 : Number(e.target.value) }))}
                required
              />
              <p className="text-[11px] text-slate-400">
                Floor location within the selected building.
              </p>
            </div>

            {/* 5. Carpet Area (Optional) */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                5. Carpet Area (sq. ft.)
              </label>
              <input
                type="number"
                step="any"
                min={0}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="e.g. 1050, 1400"
                value={form.carpetArea ?? ''}
                onChange={e => setForm(curr => ({ ...curr, carpetArea: e.target.value === '' ? undefined : Number(e.target.value) }))}
              />
              <p className="text-[11px] text-slate-400">
                Net usable internal area in square feet.
              </p>
            </div>

            {/* 6. Occupancy Status */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                6. Occupancy Status *
              </label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                value={form.status}
                onChange={e => setForm(curr => ({ ...curr, status: e.target.value }))}
                required
              >
                <option value="VACANT">🟢 VACANT (Ready for resident)</option>
                <option value="OCCUPIED">🔵 OCCUPIED (Has resident)</option>
                <option value="RESERVED">🟠 RESERVED (Blocked / Under lease)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Initial operational status of the flat.
              </p>
            </div>

            {/* Submit & Reset Buttons */}
            <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="text-cyan-400">ℹ️</span>
                <span>Saving will store this flat in MySQL table <code>flats</code> under building #{form.buildingId}.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...emptyFlatForm, buildingId: form.buildingId })}
                  className="rounded-2xl border border-white/10 bg-slate-800/80 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700/80 transition-all"
                >
                  ↺ Reset
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.buildingId}
                  className="rounded-2xl bg-cyan-400 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50 transition-all shadow-lg shadow-cyan-400/20"
                >
                  {saving ? 'Saving Flat...' : '💾 Save Flat to Building'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Building Filter Tabs & Search Controls */}
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md space-y-4">
        {/* Building Selector Tabs */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Filter by Building of Society:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedBuildingId('ALL');
                setPage(0);
              }}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                selectedBuildingId === 'ALL'
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                  : 'border border-white/10 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              🏢 All Buildings ({totalElements})
            </button>

            {buildings.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBuildingId(b.id);
                  setPage(0);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                  selectedBuildingId === b.id
                    ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                    : 'border border-white/10 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                🏢 {b.buildingName} ({b.buildingCode})
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Search Filters */}
        <div className="grid gap-3 pt-3 border-t border-white/10 sm:grid-cols-2 md:grid-cols-4">
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            placeholder="Search flat type (e.g. 2 BHK)"
            value={search.flatType ?? ''}
            onChange={event => {
              setSearch(current => ({ ...current, flatType: event.target.value }));
              setPage(0);
            }}
          />
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            type="number"
            placeholder="Filter by floor number"
            value={search.floorNumber ?? ''}
            onChange={event => {
              setSearch(current => ({
                ...current,
                floorNumber: event.target.value ? Number(event.target.value) : undefined,
              }));
              setPage(0);
            }}
          />
          <select
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
            value={search.status ?? ''}
            onChange={event => {
              setSearch(current => ({
                ...current,
                status: (event.target.value || undefined) as FlatSearchRequest['status'],
              }));
              setPage(0);
            }}
          >
            <option value="">All Occupancy Statuses</option>
            <option value="VACANT">🟢 VACANT</option>
            <option value="OCCUPIED">🔵 OCCUPIED</option>
            <option value="RESERVED">🟠 RESERVED</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch(defaultSearch);
              setSelectedBuildingId('ALL');
              setPage(0);
            }}
            className="rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700/60 transition-all"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {loadingFlats ? <LoadingSpinner /> : null}

      {/* Empty State */}
      {!loadingFlats && items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center">
          <div className="text-4xl mb-3">🚪</div>
          <h3 className="text-lg font-bold text-white">No Flats Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            {selectedBuildingId !== 'ALL'
              ? `No flats currently exist in ${buildings.find(b => b.id === selectedBuildingId)?.buildingName || 'this building'}.`
              : 'No flats matched your current filter criteria.'}
          </p>
          {isAdmin && buildings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (selectedBuildingId !== 'ALL') {
                  setForm(curr => ({ ...curr, buildingId: selectedBuildingId }));
                }
                setShowAddForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-all"
            >
              ➕ Add First Flat to Building
            </button>
          )}
        </div>
      )}

      {/* Flats Grid Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(flat => {
          const statusColors = {
            VACANT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            OCCUPIED: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
            RESERVED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          }[flat.status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';

          return (
            <article
              key={flat.id}
              className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md transition-all hover:border-cyan-500/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    🏢 {flat.buildingName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ID #{flat.id}</span>
                </div>

                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors}`}>
                  {flat.status}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-widest text-slate-400">
                  {flat.societyName || society?.societyName || 'Society'}
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  Flat {flat.flatNumber}
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/5 bg-slate-950/50 p-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Configuration</span>
                  <span className="font-semibold text-slate-200">{flat.flatType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Floor</span>
                  <span className="font-semibold text-slate-200">Floor {flat.floorNumber}</span>
                </div>
                {flat.carpetArea ? (
                  <div className="col-span-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase text-slate-500 block">Carpet Area</span>
                    <span className="font-semibold text-slate-200">{flat.carpetArea} sq. ft.</span>
                  </div>
                ) : null}
              </div>

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Stored in MySQL `flats`</span>
                  <button
                    type="button"
                    disabled={deletingId === flat.id}
                    onClick={() => handleDeleteFlat(flat.id, flat.flatNumber, flat.buildingName)}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50 transition-all"
                  >
                    {deletingId === flat.id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <Pagination
        pageNumber={page}
        totalPages={totalPages}
        onPrevious={() => setPage(current => Math.max(0, current - 1))}
        onNext={() => setPage(current => current + 1)}
      />
    </section>
  );
}