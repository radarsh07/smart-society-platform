import { type FormEvent, useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { useToast } from '@/hooks/useToast';
import { visitorApi, residentApi } from '@/services';
import type { GateTokenVerificationResult, QuickVisitorPassRequest } from '@/types/visitor';
import type { ResidentSummaryResponse } from '@/types/society';

export function VisitorEntryPage() {
  const { pushToast } = useToast();

  // Active Tab: 'SCANNER' | 'QUICK_PASS' | 'RESIDENTS_ROSTER'
  const [activeTab, setActiveTab] = useState<'SCANNER' | 'QUICK_PASS' | 'RESIDENTS_ROSTER'>('SCANNER');

  // Scanner States
  const [scanToken, setScanToken] = useState('GP-RES-6-101');
  const [scanResult, setScanResult] = useState<GateTokenVerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [barrierOpen, setBarrierOpen] = useState(false);
  const [recentActionMessage, setRecentActionMessage] = useState<string | null>(null);

  // Permanent Residents Master Roster
  const [residents, setResidents] = useState<ResidentSummaryResponse[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [residentSearch, setResidentSearch] = useState('');

  // Quick Pass Form States
  const [selectedResidentId, setSelectedResidentId] = useState<number | ''>('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCompany, setGuestCompany] = useState('Friends & Family');
  const [guestPurpose, setGuestPurpose] = useState('Personal Visit');
  const [requireApproval, setRequireApproval] = useState(true);
  const [creatingPass, setCreatingPass] = useState(false);
  const [lastCreatedToken, setLastCreatedToken] = useState<string | null>(null);

  // Load Permanent Residents
  useEffect(() => {
    loadResidentsRoster();
  }, []);

  async function loadResidentsRoster() {
    setLoadingResidents(true);
    try {
      const res = await residentApi.listResidents(0, 100);
      const activeList = res.content || [];
      setResidents(activeList);
      if (activeList.length > 0 && selectedResidentId === '') {
        setSelectedResidentId(activeList[0].id);
      }
    } catch {
      // Silently handle if error
    } finally {
      setLoadingResidents(false);
    }
  }

  // Handle Token Scan / Verification
  async function handleScan(tokenToVerify: string) {
    if (!tokenToVerify.trim()) return;
    setIsScanning(true);
    setRecentActionMessage(null);
    try {
      const result = await visitorApi.scanGateToken(tokenToVerify.trim());
      setScanResult(result);
      if (result.valid && result.allowEntry) {
        setBarrierOpen(true);
        pushToast({
          type: 'success',
          title: 'Gate Pass Verified 🟢',
          description: result.statusMessage,
        });
      } else if (result.valid && !result.allowEntry) {
        setBarrierOpen(false);
        pushToast({
          type: 'error',
          title: 'Entry Restricted ⚠️',
          description: result.statusMessage,
        });
      } else {
        setBarrierOpen(false);
        pushToast({
          type: 'error',
          title: 'Invalid or Unauthorized Pass 🔴',
          description: result.statusMessage || 'No matching active pass found in system.',
        });
      }
    } catch (err: any) {
      setScanResult(null);
      setBarrierOpen(false);
      pushToast({
        type: 'error',
        title: 'Scan Failed',
        description: err?.response?.data?.message || 'Could not verify token with gate security server.',
      });
    } finally {
      setIsScanning(false);
    }
  }

  function handleScannerSubmit(e: FormEvent) {
    e.preventDefault();
    handleScan(scanToken);
  }

  // Resident Entry / Exit Movement Logging
  async function handleLogResidentMovement(direction: 'ENTRY' | 'EXIT') {
    if (!scanResult?.residentId) return;
    try {
      const res = await visitorApi.logResidentMovement(scanResult.residentId, direction);
      if (res && typeof res === 'object') {
        setScanResult(res);
      }
      const isEntry = direction === 'ENTRY';
      setBarrierOpen(isEntry);
      const flatName = res?.flatNumber || scanResult.flatNumber || 'Flat';
      const residentName = res?.personName || scanResult.personName || 'Resident';
      const timeStr = new Date().toLocaleTimeString();
      setRecentActionMessage(
        `✓ Gate ${isEntry ? 'Entry Barrier OPENED 🟢' : 'Exit Logged 🚙'} at ${timeStr} for Flat ${flatName} (${residentName}).`
      );
      pushToast({
        type: 'success',
        title: isEntry ? 'Resident Entry Verified & Barrier Opened 🚗' : 'Resident Exit Logged 🚙',
        description: `Clearance granted for ${residentName} (Flat ${flatName}).`,
      });
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Logging Failed',
        description: err?.response?.data?.message || err?.message || 'Failed to update resident movement.',
      });
    }
  }

  // Confirm Visitor Entry & Release Barrier
  async function handleAuthorizeVisitorEntry() {
    if (!scanResult?.invitationId) return;
    try {
      await visitorApi.approveInvitation(scanResult.invitationId, {
        passStatus: 'APPROVED',
        notes: 'Gate barrier opened by security guard',
      });
      setBarrierOpen(true);
      setRecentActionMessage(
        `✓ Gate Barrier Opened at ${new Date().toLocaleTimeString()} for Guest ${scanResult.personName} (Visiting Flat ${scanResult.flatNumber}).`
      );
      pushToast({
        type: 'success',
        title: 'Barrier Released 🟢',
        description: `${scanResult.personName} checked in. Gate barrier opened.`,
      });
      // Re-scan to update state
      handleScan(scanResult.gatePassToken);
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Authorization Failed',
        description: err?.response?.data?.message || 'Failed to authorize guest.',
      });
    }
  }

  // Deny Visitor Entry
  async function handleDenyVisitor() {
    if (!scanResult?.invitationId) return;
    try {
      await visitorApi.approveInvitation(scanResult.invitationId, {
        passStatus: 'REJECTED',
        notes: 'Denied entry at main gate by security guard',
      });
      setBarrierOpen(false);
      setRecentActionMessage(
        `🔴 Entry Denied at ${new Date().toLocaleTimeString()} for ${scanResult.personName}. Visitor instructed to leave.`
      );
      pushToast({
        type: 'error',
        title: 'Entry Denied 🔴',
        description: `Visitor ${scanResult.personName} access revoked.`,
      });
      handleScan(scanResult.gatePassToken);
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Action Failed',
        description: err?.response?.data?.message || 'Failed to update pass.',
      });
    }
  }

  // Create Quick Pass for Friends & Family
  async function handleCreateQuickPass(e: FormEvent) {
    e.preventDefault();
    if (!selectedResidentId || !guestName.trim() || !guestPhone.trim()) {
      pushToast({
        type: 'error',
        title: 'Missing Fields',
        description: 'Please select a flat and enter visitor name and phone number.',
      });
      return;
    }

    setCreatingPass(true);
    try {
      const payload: QuickVisitorPassRequest = {
        residentId: Number(selectedResidentId),
        visitorName: guestName.trim(),
        visitorPhone: guestPhone.trim(),
        visitorCompany: guestCompany.trim() || 'Friends & Family',
        purpose: guestPurpose.trim() || 'Visit',
        isPreApproved: !requireApproval,
      };

      const created = await visitorApi.createQuickPass(payload);
      setLastCreatedToken(created.qrCodeToken || '');
      setScanToken(created.qrCodeToken || '');
      pushToast({
        type: 'success',
        title: 'Guest Pass Token Generated! 🎫',
        description: `Pass #${created.qrCodeToken} issued for ${guestName}. Status: ${
          requireApproval ? 'WAITING FOR OWNER APPROVAL' : 'APPROVED'
        }`,
      });

      // Clear inputs
      setGuestName('');
      setGuestPhone('');
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Failed to Generate Pass',
        description: err?.response?.data?.message || 'Could not create guest pass token.',
      });
    } finally {
      setCreatingPass(false);
    }
  }

  const filteredResidents = residents.filter((r) => {
    const q = residentSearch.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(q) ||
      (r.flatNumber && r.flatNumber.toLowerCase().includes(q)) ||
      (r.gatePassToken && r.gatePassToken.toLowerCase().includes(q)) ||
      (r.phoneNumber && r.phoneNumber.includes(q))
    );
  });

  return (
    <section className="space-y-6">
      {/* Top Bar with Live Barrier Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <TopBar
          title="Security Gate Guard & Barrier Console"
          subtitle="Real-time verification of permanent residents, flat-owner approvals for friends & family, and unauthorized entry prevention."
        />
        
        {/* Live Barrier Status Indicator */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border backdrop-blur-md shadow-lg transition-all ${
              barrierOpen
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/20'
                : 'border-rose-500/50 bg-rose-500/10 text-rose-300 shadow-rose-500/20'
            }`}
          >
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  barrierOpen ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  barrierOpen ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">Gate #1 Barrier</div>
              <div className="text-xs font-extrabold">{barrierOpen ? 'BARRIER OPEN 🟢' : 'BARRIER CLOSED 🔴'}</div>
            </div>
          </div>

          <button
            onClick={() => setBarrierOpen(!barrierOpen)}
            className="text-xs px-3 py-2 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition"
            title="Manual Guard Override"
          >
            Manual Toggle
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('SCANNER')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'SCANNER'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🛡️</span> Live Gate Scanner & Verifier
        </button>

        <button
          onClick={() => setActiveTab('QUICK_PASS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'QUICK_PASS'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🎫</span> Issue Friends & Family Pass
        </button>

        <button
          onClick={() => setActiveTab('RESIDENTS_ROSTER')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'RESIDENTS_ROSTER'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>👥</span> Permanent Residents Roster ({residents.length})
        </button>
      </div>

      {/* TAB 1: SCANNER CONSOLE */}
      {activeTab === 'SCANNER' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Scanner Input Console (Left - 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-6 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl border border-cyan-500/30">
                    📡
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Gate Pass Scanner</h3>
                    <p className="text-xs text-slate-400 font-mono">Terminal ID: GUARD-GATE-01</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  ONLINE
                </span>
              </div>

              <form onSubmit={handleScannerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Scan or Enter Gate Pass Token / Flat No.
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-cyan-500/40 bg-slate-950 px-4 py-3 font-mono text-sm text-cyan-300 placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner"
                      placeholder="e.g. GP-RES-6-101, VIS-PASS-XXXXXX, or 101"
                      value={scanToken}
                      onChange={(e) => setScanToken(e.target.value)}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Supports Permanent Resident Gate Tokens, Visitor Pass IDs, and Flat numbers.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isScanning || !scanToken.trim()}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-xs font-bold text-slate-950 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {isScanning ? 'Evaluating Pass...' : '⚡ Verify Gate Token'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScanToken('');
                      setScanResult(null);
                      setBarrierOpen(false);
                      setRecentActionMessage(null);
                    }}
                    className="px-4 py-3 rounded-2xl border border-white/10 bg-slate-800/80 text-xs text-slate-300 hover:bg-slate-700 transition"
                  >
                    Clear
                  </button>
                </div>
              </form>

              {/* Quick Preset Chips for Rapid Guard Testing */}
              <div className="border-t border-white/5 pt-4 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Test Chips:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setScanToken('GP-RES-6-101');
                      handleScan('GP-RES-6-101');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono transition"
                  >
                    🔑 Resident Abhishek (GP-RES-6-101)
                  </button>
                  <button
                    onClick={() => {
                      setScanToken('101');
                      handleScan('101');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono transition"
                  >
                    🏢 Flat 101 Lookup
                  </button>
                  {lastCreatedToken && (
                    <button
                      onClick={() => {
                        setScanToken(lastCreatedToken);
                        handleScan(lastCreatedToken);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono transition"
                    >
                      🎫 Last Guest Pass ({lastCreatedToken})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Security Protocol Guidelines */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>📋</span> Security Guard Gate Protocol
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-slate-200">Permanent Residents:</strong> Have pre-authorized gate pass
                  tokens. Instant clearance; log entry/exit.
                </li>
                <li>
                  <strong className="text-slate-200">Friends & Family:</strong> Strictly requires flat owner approval.
                  If status is <span className="text-amber-400 font-bold">PENDING</span>, barrier remains closed until
                  resident confirms.
                </li>
                <li>
                  <strong className="text-slate-200">Suspicious Persons:</strong> Any unverified token or denied visitor
                  must not be allowed into the premises.
                </li>
              </ul>
            </div>
          </div>

          {/* Scanner Evaluation & Barrier Display (Right - 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {!scanResult ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
                <div className="h-20 w-20 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-4xl text-slate-500">
                  🛡️
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Scanner Idle</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Awaiting gate pass token. Scan a resident pass or enter a visitor token to evaluate gate barrier
                    clearance.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setScanToken('GP-RES-6-101');
                      handleScan('GP-RES-6-101');
                    }}
                    className="px-5 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs transition"
                  >
                    Click to Test Resident Abhishek Scan
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result Status Banner */}
                <div
                  className={`rounded-2xl border p-5 shadow-xl backdrop-blur-md flex items-start gap-4 ${
                    scanResult.allowEntry
                      ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                      : scanResult.passStatus === 'PENDING'
                      ? 'border-amber-500/50 bg-amber-950/40 text-amber-200'
                      : 'border-rose-500/50 bg-rose-950/40 text-rose-300'
                  }`}
                >
                  <span className="text-3xl">
                    {scanResult.allowEntry ? '🟢' : scanResult.passStatus === 'PENDING' ? '⏳' : '🔴'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {scanResult.allowEntry
                          ? 'GATE CLEARANCE GRANTED'
                          : scanResult.passStatus === 'PENDING'
                          ? 'GATE ACCESS RESTRICTED - OWNER APPROVAL REQUIRED'
                          : 'GATE ACCESS FORBIDDEN'}
                      </span>
                      <span className="text-xs font-mono font-bold">{scanResult.gatePassToken}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold">{scanResult.statusMessage}</p>
                  </div>
                </div>

                {/* Identity Verification Card */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 space-y-6 shadow-2xl backdrop-blur-xl">
                  {/* Card Header with Person Info */}
                  <div className="flex items-start justify-between border-b border-white/10 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-3xl shadow-inner">
                        {scanResult.passType === 'RESIDENT' ? '👤' : '👥'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              scanResult.passType === 'RESIDENT'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {scanResult.passType === 'RESIDENT' ? 'Verified Society Resident' : 'Guest / Visitor'}
                          </span>
                          {scanResult.occupancyType && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                              {scanResult.occupancyType}
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mt-1">{scanResult.personName}</h2>
                        <p className="text-xs text-slate-400 font-mono">{scanResult.phoneNumber || 'Phone on file'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Unit</div>
                      <div className="text-xl font-extrabold text-white">Flat {scanResult.flatNumber || '101'}</div>
                      <div className="text-xs text-cyan-300">{scanResult.buildingName || 'Building'}</div>
                    </div>
                  </div>

                  {/* Verification Spec Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="rounded-xl border border-white/5 bg-slate-950 p-3">
                      <span className="text-[10px] uppercase text-slate-500 block">Pass Category</span>
                      <span className="font-bold text-white">
                        {scanResult.passType === 'RESIDENT' ? 'Permanent Resident' : scanResult.purpose || 'Visitor'}
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-slate-950 p-3">
                      <span className="text-[10px] uppercase text-slate-500 block">Gate Pass Token</span>
                      <span className="font-bold text-cyan-300">{scanResult.gatePassToken}</span>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-slate-950 p-3">
                      <span className="text-[10px] uppercase text-slate-500 block">Approval Status</span>
                      <span
                        className={`font-bold ${
                          scanResult.allowEntry
                            ? 'text-emerald-400'
                            : scanResult.passStatus === 'PENDING'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {scanResult.passType === 'RESIDENT'
                          ? 'PERMANENT PASS'
                          : scanResult.passStatus || 'UNAUTHORIZED'}
                      </span>
                    </div>
                  </div>

                  {/* Action Notification Box */}
                  {recentActionMessage && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                      <span>🔔</span>
                      <span>{recentActionMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons Depending on Pass Type */}
                  <div className="pt-2">
                    {/* SCENARIO 1: PERMANENT RESIDENT */}
                    {scanResult.passType === 'RESIDENT' && (
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Resident Gate Clearance Actions:
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleLogResidentMovement('ENTRY')}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20"
                          >
                            <span>🚗</span> Log Gate Entry & Open Barrier
                          </button>
                          <button
                            onClick={() => handleLogResidentMovement('EXIT')}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 py-3.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
                          >
                            <span>🚙</span> Log Gate Exit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SCENARIO 2: VISITOR / FRIEND & FAMILY - APPROVED */}
                    {scanResult.passType === 'VISITOR' && scanResult.allowEntry && (
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Authorized Guest Actions:
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleAuthorizeVisitorEntry}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition shadow-lg shadow-emerald-500/20"
                          >
                            <span>🟢</span> Confirm Check-in & Open Barrier
                          </button>
                          <button
                            onClick={handleDenyVisitor}
                            className="px-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SCENARIO 3: VISITOR / FRIEND & FAMILY - PENDING APPROVAL */}
                    {scanResult.passType === 'VISITOR' && !scanResult.allowEntry && scanResult.passStatus === 'PENDING' && (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2">
                          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
                            <span>⚠️</span> Gate Barrier Locked for Security
                          </div>
                          <p className="text-xs text-amber-200/90 leading-relaxed">
                            Resident <strong className="text-white">{scanResult.buildingName} Flat {scanResult.flatNumber}</strong>{' '}
                            has not yet confirmed this visitor invitation. Please ask visitor to call the resident or click
                            below to re-check if approved.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleScan(scanResult.gatePassToken)}
                            className="flex-1 rounded-2xl bg-cyan-400 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                          >
                            <span>🔄</span> Check Live Approval Status
                          </button>
                          <button
                            onClick={handleDenyVisitor}
                            className="px-6 py-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
                          >
                            <span>🔴</span> Turn Away Visitor
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SCENARIO 4: REJECTED / INVALID */}
                    {scanResult.passType === 'VISITOR' && !scanResult.allowEntry && scanResult.passStatus === 'REJECTED' && (
                      <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 space-y-2 text-rose-300 text-xs">
                        <div className="font-bold uppercase tracking-wider flex items-center gap-2">
                          <span>🚫</span> Access Denied by Resident
                        </div>
                        <p>The flat owner explicitly rejected access for this visitor. Guard must turn away the visitor.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ISSUE FRIENDS & FAMILY PASS */}
      {activeTab === 'QUICK_PASS' && (
        <div className="max-w-2xl mx-auto rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              🎫 New Gate Pass Token Generator
            </div>
            <h3 className="text-2xl font-bold text-white">Issue Pass for Friends & Family</h3>
            <p className="text-xs text-slate-400 mt-1">
              Generate a gate pass token for incoming guests. By default, entry requires resident flat owner approval.
            </p>
          </div>

          <form onSubmit={handleCreateQuickPass} className="space-y-5">
            {/* Flat / Resident Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Flat & Resident Owner <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400"
                required
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    Flat {r.flatNumber || '101'} - {r.fullName} ({r.buildingName || 'Building'}) [{r.occupancyType || 'Resident'}]
                  </option>
                ))}
              </select>
            </div>

            {/* Visitor Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Visitor Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Verma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Visitor Contact Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9811223344"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            {/* Relation / Purpose */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Category / Relationship
                </label>
                <select
                  value={guestCompany}
                  onChange={(e) => setGuestCompany(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400"
                >
                  <option value="Friends & Family">Friends & Family</option>
                  <option value="Personal Guest">Personal Guest</option>
                  <option value="Courier / Delivery">Courier / Delivery</option>
                  <option value="Home Maintenance Service">Home Maintenance Service</option>
                  <option value="Cab / Driver">Cab / Driver</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Purpose of Visit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Family gathering, Lunch"
                  value={guestPurpose}
                  onChange={(e) => setGuestPurpose(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Strict Approval Checkbox */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-start gap-3">
              <input
                type="checkbox"
                id="requireApproval"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="requireApproval" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                <strong className="text-white block mb-0.5">Require Flat Owner Approval (Strict Security)</strong>
                Keep token in <span className="text-amber-400 font-bold">PENDING</span> status until the resident
                approves on their resident dashboard. Barrier will NOT open until resident confirms.
              </label>
            </div>

            <button
              type="submit"
              disabled={creatingPass}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 text-xs font-bold text-slate-950 hover:from-cyan-300 hover:to-blue-400 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              {creatingPass ? 'Generating Token...' : '🎫 Generate Gate Pass Token'}
            </button>
          </form>

          {/* Recently Issued Confirmation */}
          {lastCreatedToken && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  ✓ Token Generated Successfully
                </span>
                <span className="font-mono text-base font-extrabold text-cyan-300">{lastCreatedToken}</span>
              </div>
              <p className="text-xs text-slate-300">
                Gate token has been registered in the system. The resident has received this pass request.
              </p>
              <button
                onClick={() => {
                  setScanToken(lastCreatedToken);
                  setActiveTab('SCANNER');
                  handleScan(lastCreatedToken);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition"
              >
                Inspect Pass in Gate Scanner →
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERMANENT RESIDENTS ROSTER */}
      {activeTab === 'RESIDENTS_ROSTER' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by Flat, Name, or Token..."
                value={residentSearch}
                onChange={(e) => setResidentSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2.5 pl-10 text-xs text-slate-200 outline-none focus:border-cyan-400"
              />
              <span className="absolute left-3.5 top-3 text-slate-500 text-xs">🔍</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Total Permanent Residents: <strong className="text-white">{residents.length}</strong>
            </div>
          </div>

          {loadingResidents ? (
            <div className="p-12 text-center text-slate-500">Loading resident directory...</div>
          ) : filteredResidents.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center text-slate-400">
              No matching residents found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResidents.map((resident) => {
                const token = resident.gatePassToken || `GP-RES-${resident.id}-${resident.flatNumber || '101'}`;
                return (
                  <div
                    key={resident.id}
                    className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 space-y-4 backdrop-blur-md hover:border-cyan-500/40 transition shadow-lg"
                  >
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
                          👤
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{resident.fullName}</h4>
                          <span className="text-[10px] font-mono text-cyan-300">@{resident.username || 'resident'}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {resident.occupancyType || 'OWNER'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Flat & Building:</span>
                        <span className="text-white font-bold">
                          Flat {resident.flatNumber || '101'} ({resident.buildingName || 'Lavender'})
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Contact Phone:</span>
                        <span className="text-slate-200">{resident.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Auto Gate Token:</span>
                        <span className="text-cyan-300 font-bold">{token}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setScanToken(token);
                        setActiveTab('SCANNER');
                        handleScan(token);
                      }}
                      className="w-full rounded-xl bg-cyan-400 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-500/20"
                    >
                      ⚡ Verify at Gate
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
