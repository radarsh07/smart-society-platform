import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { buildingApi, residentApi, societyApi } from '@/services';
import type {
  BuildingResponse,
  ResidentSearchRequest,
  ResidentSummaryResponse,
  SocietyResponse,
} from '@/types/society';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/hooks/useToast';
import { useRole } from '@/context/RoleContext';

const defaultSearch: ResidentSearchRequest = {
  page: 0,
  size: 12,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};

export function ResidentsPage() {
  const { role } = useRole();
  const isAdmin = role === 'ADMIN';

  const [society, setSociety] = useState<SocietyResponse | null>(null);
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [selectedBuildingName, setSelectedBuildingName] = useState<string>('ALL');

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING'>('ALL');
  const [pendingApprovals, setPendingApprovals] = useState<ResidentSummaryResponse[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [search, setSearch] = useState<ResidentSearchRequest>(defaultSearch);
  const [items, setItems] = useState<ResidentSummaryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingResidents, setLoadingResidents] = useState(false);

  const { pushToast } = useToast();

  // 1. Fetch Society & Buildings
  useEffect(() => {
    async function loadMasterData() {
      setLoading(true);
      try {
        const societyData = await societyApi.getCurrentSociety();
        setSociety(societyData);

        if (societyData?.id) {
          const buildingsRes = await buildingApi.listBuildings(societyData.id, 0, 100);
          setBuildings(buildingsRes.content || []);
        }
      } catch (err) {
        console.error('Error fetching society or buildings', err);
      } finally {
        setLoading(false);
      }
    }

    loadMasterData();
  }, []);

  // 2. Fetch Pending Approvals
  const fetchPendingApprovals = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoadingPending(true);
      const data = await residentApi.getPendingApprovals();
      setPendingApprovals(data);
    } catch {
      // ignore
    } finally {
      setLoadingPending(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  // 3. Fetch Residents based on filters
  const loadResidents = useCallback(() => {
    setLoadingResidents(true);
    const filterParams: ResidentSearchRequest = {
      ...search,
      page,
      buildingName: selectedBuildingName !== 'ALL' ? selectedBuildingName : search.buildingName,
    };

    residentApi.searchResidents(filterParams)
      .then(result => {
        setItems(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      })
      .catch(() => pushToast({ type: 'error', title: 'Failed to load residents' }))
      .finally(() => setLoadingResidents(false));
  }, [page, search, selectedBuildingName, pushToast]);

  useEffect(() => {
    loadResidents();
  }, [loadResidents]);

  const handleApprove = async (residentId: number, name: string) => {
    try {
      setProcessingId(residentId);
      await residentApi.approveResident(residentId);
      pushToast({
        type: 'success',
        title: 'Resident Approved',
        description: `${name} has been verified and granted active resident access.`,
      });
      fetchPendingApprovals();
      loadResidents();
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Approval Failed',
        description: err?.response?.data?.message || 'Could not approve resident',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (residentId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to reject the membership registration for ${name}?`)) {
      return;
    }
    try {
      setProcessingId(residentId);
      await residentApi.rejectResident(residentId);
      pushToast({
        type: 'info',
        title: 'Registration Rejected',
        description: `Application for ${name} was rejected.`,
      });
      fetchPendingApprovals();
      loadResidents();
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Rejection Failed',
        description: err?.response?.data?.message || 'Could not reject resident',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <TopBar
        title="Resident Directory"
        subtitle="Search, inspect, and onboard residents mapped to society buildings and flats."
      />

      {loading ? <LoadingSpinner /> : null}

      {/* Target Society Context Banner */}
      {!loading && society && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950/80 p-6 backdrop-blur-md">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-2xl shadow-lg shadow-cyan-500/10">
              👥
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
              to="/flats"
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20"
            >
              🚪 View Flats
            </Link>
            {isAdmin && (
              <Link
                to="/residents/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
              >
                ➕ Register New Resident
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Top Tab Bar: Directory vs Pending Approvals */}
      {isAdmin && (
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <span>👥</span> Active Residents ({totalElements})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-all ${
              activeTab === 'PENDING'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <span>⏳</span> Pending Member Approvals
            {pendingApprovals.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'PENDING' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500 text-slate-950 animate-pulse'
              }`}>
                {pendingApprovals.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* PENDING APPROVALS TAB VIEW */}
      {isAdmin && activeTab === 'PENDING' ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-500/30 bg-amber-950/20 p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⏳</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Pending Resident Applications</h3>
                  <p className="text-xs text-amber-300/80">
                    Review and verify new member registration requests. Approved members will immediately gain access to their flat portal.
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/5">
                🔒 Member passwords remain confidential and encrypted
              </div>
            </div>
          </div>

          {loadingPending ? (
            <LoadingSpinner />
          ) : pendingApprovals.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center space-y-3">
              <div className="text-4xl">✨</div>
              <h3 className="text-lg font-bold text-white">No Pending Approvals</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All resident membership requests have been reviewed. When a prospective resident registers via the public signup portal, their application will appear here for your review.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pendingApprovals.map((pending) => (
                <article
                  key={pending.id}
                  className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">ID #{pending.id}</span>
                          {pending.username && (
                            <span className="text-[11px] text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              @{pending.username}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xl font-bold text-white tracking-tight mt-1">
                          {pending.fullName}
                        </h4>
                      </div>
                      <span className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        PENDING APPROVAL
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                        🏢 {pending.buildingName}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
                        🚪 Flat {pending.flatNumber}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                        Resident Member
                      </span>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-3.5 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-slate-500">📧</span>
                        <span className="truncate">{pending.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-slate-500">📞</span>
                        <span>{pending.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={processingId === pending.id}
                      onClick={() => handleApprove(pending.id, pending.fullName)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {processingId === pending.id ? 'Approving...' : '✓ Approve & Activate'}
                    </button>
                    <button
                      type="button"
                      disabled={processingId === pending.id}
                      onClick={() => handleReject(pending.id, pending.fullName)}
                      className="py-2.5 px-4 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 font-bold text-xs transition disabled:opacity-50"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ACTIVE RESIDENTS DIRECTORY VIEW */
        <>
          {/* Building Filter Tabs & Search Controls */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/50 p-6 backdrop-blur-md space-y-4">
            {/* Building Filter Tabs */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Filter by Building:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBuildingName('ALL');
                    setPage(0);
                  }}
                  className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                    selectedBuildingName === 'ALL'
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
                      setSelectedBuildingName(b.buildingName);
                      setPage(0);
                    }}
                    className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                      selectedBuildingName === b.buildingName
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
                placeholder="Search resident name"
                value={search.residentName ?? ''}
                onChange={event => {
                  setSearch(current => ({ ...current, residentName: event.target.value }));
                  setPage(0);
                }}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none uppercase"
                placeholder="Search flat number (e.g. 101)"
                value={search.flatNumber ?? ''}
                onChange={event => {
                  setSearch(current => ({ ...current, flatNumber: event.target.value }));
                  setPage(0);
                }}
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                placeholder="Search phone number"
                value={search.phoneNumber ?? ''}
                onChange={event => {
                  setSearch(current => ({ ...current, phoneNumber: event.target.value }));
                  setPage(0);
                }}
              />
              <select
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                value={search.residentStatus ?? ''}
                onChange={event => {
                  setSearch(current => ({
                    ...current,
                    residentStatus: (event.target.value || undefined) as any,
                  }));
                  setPage(0);
                }}
              >
                <option value="">All Resident Statuses</option>
                <option value="ACTIVE">🟢 ACTIVE</option>
                <option value="INACTIVE">⚪ INACTIVE</option>
                <option value="MOVED_OUT">🔴 MOVED_OUT</option>
              </select>
            </div>
          </div>

          {loadingResidents ? <LoadingSpinner /> : null}

          {/* Empty State */}
          {!loadingResidents && items.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-bold text-white">No Residents Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                {selectedBuildingName !== 'ALL'
                  ? `No residents currently registered in building ${selectedBuildingName}.`
                  : 'No residents matched your current filter criteria.'}
              </p>
              {isAdmin && (
                <Link
                  to="/residents/new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-all"
                >
                  ➕ Register New Resident
                </Link>
              )}
            </div>
          )}

          {/* Residents Grid Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map(resident => {
              const statusColors = {
                ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                INACTIVE: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
                MOVED_OUT: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                PENDING_APPROVAL: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                REJECTED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
              }[resident.residentStatus] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';

              return (
                <article
                  key={resident.id}
                  className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md transition-all hover:border-cyan-500/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">ID #{resident.id}</span>
                        {resident.username && (
                          <span className="text-[11px] text-cyan-300 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                            @{resident.username}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                        {resident.fullName}
                      </h3>
                    </div>

                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors}`}>
                      {resident.residentStatus}
                    </span>
                  </div>

                  {/* Exact Location Pill */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                      🏢 {resident.buildingName}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
                      🚪 Flat {resident.flatNumber}
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950/50 p-3 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500">📧</span>
                      <span className="truncate">{resident.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500">📞</span>
                      <span>{resident.phoneNumber}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-[10px] text-slate-500">Stored in MySQL <code>residents</code></span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/residents/${resident.id}`}
                        className="rounded-xl border border-white/10 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700/60 transition-all"
                      >
                        Details
                      </Link>
                      {isAdmin && (
                        <Link
                          to={`/residents/${resident.id}/edit`}
                          className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
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
        </>
      )}
    </section>
  );
}