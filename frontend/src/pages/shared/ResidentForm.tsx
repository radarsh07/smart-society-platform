import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildingApi, flatApi, residentApi, societyApi } from '@/services';
import type {
  BuildingResponse,
  FlatResponse,
  ResidentRequest,
  ResidentResponse,
  SocietyResponse,
} from '@/types/society';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

const emptyForm: ResidentRequest = {
  buildingId: 0,
  flatId: 0,
  username: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  occupancyType: 'OWNER',
  residentStatus: 'ACTIVE',
  initialPassword: '',
  gender: undefined,
  dateOfBirth: '',
  occupation: '',
  bloodGroup: '',
  governmentIdNumber: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  moveInDate: '',
  profilePhotoUrl: '',
  familyMembers: [],
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export function ResidentForm({ mode, residentId }: { mode: 'create' | 'edit'; residentId?: number }) {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [society, setSociety] = useState<SocietyResponse | null>(null);
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [flats, setFlats] = useState<FlatResponse[]>([]);
  
  const [form, setForm] = useState<ResidentRequest>(emptyForm);
  const [resident, setResident] = useState<ResidentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFlats, setLoadingFlats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 1. Initial Load: Society, Buildings, and Resident profile
  useEffect(() => {
    let isMounted = true;

    async function loadMasterData() {
      try {
        const societyData = await societyApi.getCurrentSociety();
        if (!isMounted) return;
        setSociety(societyData);

        let bList: BuildingResponse[] = [];
        if (societyData?.id) {
          const buildingsRes = await buildingApi.listBuildings(societyData.id, 0, 100);
          bList = buildingsRes.content || [];
          if (!isMounted) return;
          setBuildings(bList);
        }

        // If editing an existing resident, load their profile
        if (mode === 'edit' && residentId) {
          try {
            const data = await residentApi.getResident(residentId);
            if (!isMounted) return;
            setResident(data);
            setForm({
              buildingId: data.buildingId || (bList.length > 0 ? bList[0].id : 0),
              flatId: data.flatId || 0,
              username: data.username || '',
              fullName: data.fullName || '',
              profilePhotoUrl: data.profilePhotoUrl || '',
              email: data.email || '',
              phoneNumber: data.phoneNumber || '',
              emergencyContactName: data.emergencyContactName || '',
              emergencyContactPhone: data.emergencyContactPhone || '',
              gender: data.gender,
              dateOfBirth: data.dateOfBirth || '',
              occupation: data.occupation || '',
              bloodGroup: data.bloodGroup || '',
              governmentIdNumber: data.governmentIdNumber || '',
              moveInDate: data.moveInDate || '',
              occupancyType: data.occupancyType || 'OWNER',
              residentStatus: data.residentStatus || 'ACTIVE',
              familyMembers: data.familyMembers || [],
              initialPassword: '',
            });

            // Load flats for that resident's building
            const targetBuildingId = data.buildingId || (bList.length > 0 ? bList[0].id : 0);
            if (targetBuildingId) {
              const flatsRes = await flatApi.listFlats({ buildingId: targetBuildingId, size: 200 });
              if (!isMounted) return;
              setFlats(flatsRes.content || []);
            }
          } catch (resErr: any) {
            console.error('Failed to load resident profile', resErr);
            pushToast({
              type: 'error',
              title: 'Resident Not Found',
              description: resErr?.response?.data?.message || 'Could not load resident profile details.',
            });
          }
        } else if (mode === 'create' && bList.length > 0) {
          // Preload first building's flats for smooth creation flow
          setForm(curr => ({ ...curr, buildingId: bList[0].id }));
          try {
            const flatsRes = await flatApi.listFlats({ buildingId: bList[0].id, size: 200 });
            if (!isMounted) return;
            setFlats(flatsRes.content || []);
          } catch {
            // ignore initial flat load error
          }
        }
      } catch (err) {
        console.error('Failed to load master data', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMasterData();

    return () => {
      isMounted = false;
    };
  }, [mode, residentId]);

  // Handle building change -> load its specific flats
  async function handleBuildingChange(buildingId: number) {
    setForm(curr => ({ ...curr, buildingId, flatId: 0 }));
    if (!buildingId || buildingId === 0) {
      setFlats([]);
      return;
    }

    setLoadingFlats(true);
    try {
      const flatsRes = await flatApi.listFlats({ buildingId, size: 200 });
      setFlats(flatsRes.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to load flats for selected building' });
      setFlats([]);
    } finally {
      setLoadingFlats(false);
    }
  }

  const selectedBuilding = buildings.find(b => b.id === Number(form.buildingId));
  const selectedFlat = flats.find(f => f.id === Number(form.flatId));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.buildingId || form.buildingId === 0) {
      pushToast({
        type: 'error',
        title: 'Building Required',
        description: 'Please select which building of the society this resident resides in.',
      });
      return;
    }

    if (!form.flatId || form.flatId === 0) {
      pushToast({
        type: 'error',
        title: 'Flat Required',
        description: 'Please select the specific flat number in the chosen building.',
      });
      return;
    }

    if (!form.username.trim() || form.username.trim().length < 3) {
      pushToast({
        type: 'error',
        title: 'Unique Username Required',
        description: 'Please enter a unique username (at least 3 characters) for resident portal login.',
      });
      return;
    }

    if (!form.fullName.trim()) {
      pushToast({
        type: 'error',
        title: 'Full Name Required',
        description: 'Please enter the resident’s full legal name.',
      });
      return;
    }

    if (!form.email.trim()) {
      pushToast({
        type: 'error',
        title: 'Email Required',
        description: 'Please enter a valid email address for resident communications and login.',
      });
      return;
    }

    if (!form.phoneNumber.trim()) {
      pushToast({
        type: 'error',
        title: 'Phone Number Required',
        description: 'Please enter the primary mobile number.',
      });
      return;
    }

    if (mode === 'create' && (!form.initialPassword || form.initialPassword.length < 8)) {
      pushToast({
        type: 'error',
        title: 'Initial Password Required',
        description: 'Password must be at least 8 characters long for the resident’s portal account.',
      });
      return;
    }

    setSaving(true);
    try {
      const payload: ResidentRequest = {
        buildingId: Number(form.buildingId),
        flatId: Number(form.flatId),
        username: form.username.trim().toLowerCase(),
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        occupancyType: form.occupancyType,
        residentStatus: form.residentStatus || 'ACTIVE',
        initialPassword: form.initialPassword ? form.initialPassword : undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth ? form.dateOfBirth : undefined,
        occupation: form.occupation?.trim() || undefined,
        bloodGroup: form.bloodGroup || undefined,
        governmentIdNumber: form.governmentIdNumber?.trim() || undefined,
        emergencyContactName: form.emergencyContactName?.trim() || undefined,
        emergencyContactPhone: form.emergencyContactPhone?.trim() || undefined,
        moveInDate: form.moveInDate ? form.moveInDate : undefined,
        profilePhotoUrl: form.profilePhotoUrl?.trim() || undefined,
        familyMembers: form.familyMembers || [],
      };

      if (mode === 'create') {
        await residentApi.createResident(payload);
        pushToast({
          type: 'success',
          title: 'Resident Registered Successfully',
          description: `${payload.fullName} registered for Flat ${selectedFlat?.flatNumber || ''} in ${selectedBuilding?.buildingName || ''}.`,
        });
      } else if (residentId) {
        await residentApi.updateResident(residentId, payload);
        pushToast({
          type: 'success',
          title: 'Resident Updated',
          description: `${payload.fullName} profile updated successfully.`,
        });
      }

      navigate('/residents');
    } catch (err: any) {
      const description = err?.response?.data?.message || err?.message || 'Operation failed. Check resident details.';
      pushToast({ type: 'error', title: 'Save Failed', description });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-6">
      <TopBar
        title={mode === 'create' ? 'Register New Resident' : 'Edit Resident Profile'}
        subtitle="Select the target building and flat to assign the resident account accurately in MySQL."
      />

      {/* Target Society Context Banner */}
      {society && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950/80 p-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-2xl">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Target Society
                </span>
                <span className="text-xs text-slate-400">ID #{society.id}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">{society.societyName}</h2>
              <p className="text-xs text-slate-400">
                {society.city}, {society.state} {society.pincode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/flats"
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
            >
              🚪 View Flats
            </Link>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-8">
        
        {/* SECTION 1: RESIDENCE LOCATION (SOCIETY, BUILDING, FLAT) */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <span className="text-xl">📍</span>
            <div>
              <h3 className="text-base font-bold text-white">1. Residence Location Selection</h3>
              <p className="text-xs text-slate-400">
                Choose the exact Building and Flat number belonging to {society?.societyName || 'the society'}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* Building Selection Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Select Building of Society *</span>
                <span className="text-[10px] text-cyan-400 font-normal">Choose Building</span>
              </label>
              <select
                className="w-full rounded-2xl border border-cyan-500/30 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                value={form.buildingId}
                onChange={e => handleBuildingChange(Number(e.target.value))}
                required
              >
                <option value={0} disabled>-- Choose Building (e.g. Lavender, Lily) --</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>
                    🏢 {b.buildingName} ({b.buildingCode}) • {b.totalFloors} Floors
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                {selectedBuilding ? `Selected: ${selectedBuilding.buildingName} (${selectedBuilding.totalFloors} floors)` : 'Select the building first to view its flats.'}
              </p>
            </div>

            {/* Flat Selection Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Select Flat / Unit Number *</span>
                <span className="text-[10px] text-cyan-400 font-normal">
                  {loadingFlats ? 'Loading flats...' : `${flats.length} flats found`}
                </span>
              </label>
              <select
                disabled={!form.buildingId || form.buildingId === 0 || loadingFlats}
                className="w-full rounded-2xl border border-cyan-500/30 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-50 transition-colors"
                value={form.flatId}
                onChange={e => setForm(curr => ({ ...curr, flatId: Number(e.target.value) }))}
                required
              >
                <option value={0} disabled>
                  {!form.buildingId ? '-- Please select building first --' : flats.length === 0 ? '-- No flats exist in this building --' : '-- Choose Flat Number --'}
                </option>
                {flats.map(f => (
                  <option key={f.id} value={f.id}>
                    🚪 Flat {f.flatNumber} ({f.flatType}, Floor {f.floorNumber}) — [{f.status}]
                  </option>
                ))}
              </select>
              
              {form.buildingId > 0 && flats.length === 0 && !loadingFlats ? (
                <div className="text-[11px] text-amber-400 flex items-center gap-1.5 mt-1">
                  <span>⚠️ No flats found in this building.</span>
                  <Link to="/flats" className="underline font-bold text-cyan-300">
                    Add flats in Flat Management
                  </Link>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  {selectedFlat ? `Selected: Flat ${selectedFlat.flatNumber} (${selectedFlat.flatType}, Floor ${selectedFlat.floorNumber})` : 'Choose the flat from the list.'}
                </p>
              )}
            </div>

            {/* Occupancy Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Occupancy Ownership Type *
              </label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                value={form.occupancyType}
                onChange={e => setForm(curr => ({ ...curr, occupancyType: e.target.value as ResidentRequest['occupancyType'] }))}
                required
              >
                <option value="OWNER">🏠 OWNER (Flat Owner / Landlord)</option>
                <option value="TENANT">🔑 TENANT (Renting / Leased)</option>
              </select>
              <p className="text-[11px] text-slate-400">Designates whether resident is property owner or tenant.</p>
            </div>

            {/* Resident Lifecycle Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Account Status *
              </label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                value={form.residentStatus}
                onChange={e => setForm(curr => ({ ...curr, residentStatus: e.target.value as ResidentRequest['residentStatus'] }))}
                required
              >
                <option value="ACTIVE">🟢 ACTIVE (Currently residing)</option>
                <option value="INACTIVE">⚪ INACTIVE (Temporarily absent)</option>
                <option value="MOVED_OUT">🔴 MOVED_OUT (Vacated premises)</option>
              </select>
              <p className="text-[11px] text-slate-400">Active status grants resident access to community features.</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: RESIDENT PERSONAL DETAILS & LOGIN */}
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <span className="text-xl">👤</span>
            <div>
              <h3 className="text-base font-bold text-white">2. Resident Profile & Login Account</h3>
              <p className="text-xs text-slate-400">
                Personal identity and authentication credentials for this resident.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* 1. Unique Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>1. Unique Login Username *</span>
                <span className="text-[10px] text-cyan-400 font-normal">Must be unique</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-sm">@</span>
                <input
                  className="w-full rounded-2xl border border-cyan-500/30 bg-slate-950/80 pl-9 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  placeholder="e.g. adarsh_101, rahul_sharma"
                  value={form.username}
                  onChange={e => setForm(curr => ({ ...curr, username: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Each resident has their own private username for signing in.
              </p>
            </div>

            {/* 2. Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Full Legal Name *
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="e.g. Adarsh Sharma"
                value={form.fullName}
                onChange={e => setForm(curr => ({ ...curr, fullName: e.target.value }))}
                required
              />
              <p className="text-[11px] text-slate-400">Displayed on directory and society notices.</p>
            </div>

            {/* 3. Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                3. Email Address *
              </label>
              <input
                type="email"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="e.g. adarsh@gmail.com"
                value={form.email}
                onChange={e => setForm(curr => ({ ...curr, email: e.target.value }))}
                required
              />
              <p className="text-[11px] text-slate-400">Used for official communications and password reset.</p>
            </div>

            {/* 4. Phone Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                4. Phone Number *
              </label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="e.g. +91 98765 43210"
                value={form.phoneNumber}
                onChange={e => setForm(curr => ({ ...curr, phoneNumber: e.target.value }))}
                required
              />
              <p className="text-[11px] text-slate-400">Gate security entry & visitor OTP notifications.</p>
            </div>

            {/* 5. Password */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>{mode === 'create' ? '5. Private Account Password *' : '5. Reset Account Password (Optional)'}</span>
                <span className="text-[10px] text-cyan-400 font-normal">Min 8 characters</span>
              </label>
              <input
                type="password"
                className="w-full rounded-2xl border border-cyan-500/30 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder={mode === 'create' ? 'Enter private password (min 8 chars, e.g. Adarsh@2025)' : 'Leave blank to keep existing password'}
                value={form.initialPassword}
                onChange={e => setForm(curr => ({ ...curr, initialPassword: e.target.value }))}
                required={mode === 'create'}
              />
              <p className="text-[11px] text-slate-400">
                Encrypted in MySQL using BCrypt. Nobody else can access this resident’s portal.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: OPTIONAL KYC & EMERGENCY DETAILS */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(prev => !prev)}
            className="flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors pb-2"
          >
            <span>{showAdvanced ? '▼' : '▶'}</span>
            <span>{showAdvanced ? 'Hide Additional Details & KYC (Optional)' : 'Show Additional Details & KYC (Blood Group, ID, Emergency Contact)'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-white/10 grid gap-5 md:grid-cols-3">
              {/* Gender */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Gender</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  value={form.gender ?? ''}
                  onChange={e => setForm(curr => ({ ...curr, gender: (e.target.value || undefined) as any }))}
                >
                  <option value="">-- Select Gender --</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Date of Birth</label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  value={form.dateOfBirth ?? ''}
                  onChange={e => setForm(curr => ({ ...curr, dateOfBirth: e.target.value }))}
                />
              </div>

              {/* Blood Group */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Blood Group</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  value={form.bloodGroup ?? ''}
                  onChange={e => setForm(curr => ({ ...curr, bloodGroup: e.target.value }))}
                >
                  <option value="">-- Select Blood Group --</option>
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Occupation</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. Software Engineer, Doctor"
                  value={form.occupation ?? ''}
                  onChange={e => setForm(curr => ({ ...curr, occupation: e.target.value }))}
                />
              </div>

              {/* Government ID */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Government ID / Aadhaar</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. 1234-5678-9012"
                  value={form.governmentIdNumber ?? ''}
                  onChange={e => setForm(curr => ({ ...curr, governmentIdNumber: e.target.value }))}
                />
              </div>

              {/* Move-in Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Move-in Date</label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  value={form.moveInDate ?? ''}
                  onChange={e => setForm(curr => ({ ...curr, moveInDate: e.target.value }))}
                />
              </div>

              {/* Emergency Contact Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Contact Name</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. Parent / Spouse"
                  value={form.emergencyContactName ?? ''}
                  onChange={e => setForm(curr => ({ ...curr, emergencyContactName: e.target.value }))}
                />
              </div>

              {/* Emergency Contact Phone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Contact Phone</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. +91 98765 00000"
                  value={form.emergencyContactPhone ?? ''}
                  onChange={e => setForm(curr => ({ ...curr, emergencyContactPhone: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
          <div className="text-xs text-slate-400">
            {selectedBuilding && selectedFlat ? (
              <span className="text-emerald-400 font-semibold">
                ✓ Ready to save resident into {selectedBuilding.buildingName} • Flat {selectedFlat.flatNumber}
              </span>
            ) : (
              <span>⚠️ Please select both a building and flat above before submitting.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/residents"
              className="rounded-2xl border border-white/10 bg-slate-800/80 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700/80 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !form.buildingId || !form.flatId}
              className="rounded-2xl bg-cyan-400 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50 transition-all shadow-lg shadow-cyan-400/20"
            >
              {saving ? 'Saving Resident...' : mode === 'create' ? '💾 Register Resident' : '💾 Update Resident'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}