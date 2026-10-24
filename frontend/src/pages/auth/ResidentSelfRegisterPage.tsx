import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  publicRegistrationApi,
  PublicSocietyOption,
  PublicBuildingOption,
  PublicFlatOption,
} from '@/services/societyApi';

export function ResidentSelfRegisterPage() {
  const navigate = useNavigate();

  // Master options
  const [societies, setSocieties] = useState<PublicSocietyOption[]>([]);
  const [buildings, setBuildings] = useState<PublicBuildingOption[]>([]);
  const [flats, setFlats] = useState<PublicFlatOption[]>([]);

  // Selected hierarchy
  const [selectedSocietyId, setSelectedSocietyId] = useState<number | ''>('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | ''>('');
  const [selectedFlatId, setSelectedFlatId] = useState<number | ''>('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [occupancyType, setOccupancyType] = useState<'OWNER' | 'TENANT'>('OWNER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [fetchingHierarchy, setFetchingHierarchy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<{
    societyName?: string;
    buildingName?: string;
    flatNumber?: string;
    username?: string;
  }>({});

  // 1. Load Societies
  useEffect(() => {
    async function loadSocieties() {
      try {
        setFetchingHierarchy(true);
        const data = await publicRegistrationApi.getSocieties();
        setSocieties(data);
        if (data.length === 1) {
          setSelectedSocietyId(data[0].id);
        }
      } catch (err: any) {
        setErrorMessage('Failed to load registered societies. Please ensure server is running.');
      } finally {
        setFetchingHierarchy(false);
      }
    }
    loadSocieties();
  }, []);

  // 2. Load Buildings when society selected
  useEffect(() => {
    if (!selectedSocietyId) {
      setBuildings([]);
      setSelectedBuildingId('');
      return;
    }
    async function loadBuildings() {
      try {
        const data = await publicRegistrationApi.getBuildings(Number(selectedSocietyId));
        setBuildings(data);
        if (data.length === 1) {
          setSelectedBuildingId(data[0].id);
        }
      } catch {
        setBuildings([]);
      }
    }
    loadBuildings();
  }, [selectedSocietyId]);

  // 3. Load Flats when building selected
  useEffect(() => {
    if (!selectedBuildingId) {
      setFlats([]);
      setSelectedFlatId('');
      return;
    }
    async function loadFlats() {
      try {
        const data = await publicRegistrationApi.getFlats(Number(selectedBuildingId));
        setFlats(data);
      } catch {
        setFlats([]);
      }
    }
    loadFlats();
  }, [selectedBuildingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedBuildingId || !selectedFlatId) {
      setErrorMessage('Please select your society, building, and flat number.');
      return;
    }
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      setErrorMessage('Please enter your legal name, email, and contact phone.');
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const cleanUsername = username.trim().replace(/^@+/, '').toLowerCase();
      await publicRegistrationApi.selfRegister({
        buildingId: Number(selectedBuildingId),
        flatId: Number(selectedFlatId),
        username: cleanUsername,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        occupancyType,
        password,
      });

      const chosenSociety = societies.find((s) => s.id === Number(selectedSocietyId));
      const chosenBuilding = buildings.find((b) => b.id === Number(selectedBuildingId));
      const chosenFlat = flats.find((f) => f.id === Number(selectedFlatId));

      setSubmittedDetails({
        societyName: chosenSociety?.societyName || 'Society',
        buildingName: chosenBuilding?.buildingName || 'Building',
        flatNumber: chosenFlat?.flatNumber || 'Flat',
        username: cleanUsername,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.message || 'Registration failed. Please check your inputs.';
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_50%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10">
      
      {/* Top Header Bar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏢</span>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Secure Smart Apartment Society</h1>
            <p className="text-xs text-slate-400">Resident Membership Portal & Self-Registration</p>
          </div>
        </div>
        <Link
          to="/"
          className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
        >
          ← Back to Login
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full my-8">
        {isSubmitted ? (
          /* Confirmation Success Card */
          <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-4xl border border-emerald-500/30">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Application Submitted Successfully!</h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                Your resident membership registration has been securely routed to the{' '}
                <span className="font-semibold text-emerald-400">Society Administrator</span> for verification and approval.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 max-w-md mx-auto text-left space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Applicant:</span>
                <span className="font-semibold text-slate-200">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Society:</span>
                <span className="font-semibold text-slate-200">{submittedDetails.societyName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Unit:</span>
                <span className="font-semibold text-slate-200">
                  Flat {submittedDetails.flatNumber} ({submittedDetails.buildingName})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Private Username:</span>
                <span className="font-mono font-semibold text-emerald-400">@{submittedDetails.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Application Status:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ⏳ PENDING ADMIN APPROVAL
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-4 max-w-lg mx-auto text-xs text-emerald-300/90 leading-relaxed text-left">
              🔒 <strong>Your Password is Private:</strong> Your chosen password is encrypted with BCrypt. The Society Admin can approve or reject your flat residency, but can <em>never</em> see or use your password. Once approved by Admin, you can log in immediately.
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20"
              >
                Go to Portal Login
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            {/* Form Title & Info */}
            <div className="border-b border-slate-800 pb-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
                <span>📝 RESIDENT SELF-REGISTRATION</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Register as Resident Member</h2>
              <p className="text-sm text-slate-400 mt-1">
                Select your society flat and create your private credentials. Your account will be activated upon Administrator review.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="rounded-xl border border-red-500/50 bg-red-950/40 p-4 text-sm text-red-300 flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: SOCIETY & FLAT SELECTION */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>📍 1. Apartment Location</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Society */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Society <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={selectedSocietyId}
                      onChange={(e) => setSelectedSocietyId(e.target.value ? Number(e.target.value) : '')}
                      disabled={fetchingHierarchy || societies.length === 0}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
                      required
                    >
                      <option value="">-- Choose Society --</option>
                      {societies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.societyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Building */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Building / Wing <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={selectedBuildingId}
                      onChange={(e) => setSelectedBuildingId(e.target.value ? Number(e.target.value) : '')}
                      disabled={!selectedSocietyId || buildings.length === 0}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
                      required
                    >
                      <option value="">-- Choose Building --</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.buildingName} ({b.buildingCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Flat */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Flat / Unit <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={selectedFlatId}
                      onChange={(e) => setSelectedFlatId(e.target.value ? Number(e.target.value) : '')}
                      disabled={!selectedBuildingId || flats.length === 0}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
                      required
                    >
                      <option value="">
                        {flats.length === 0 && selectedBuildingId ? 'No flats configured' : '-- Choose Flat --'}
                      </option>
                      {flats.map((f) => (
                        <option key={f.id} value={f.id}>
                          Flat {f.flatNumber} ({f.flatType || 'Unit'} - Floor {f.floorNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Occupancy Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Occupancy Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setOccupancyType('OWNER')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition ${
                        occupancyType === 'OWNER'
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>🔑</span> Unit Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => setOccupancyType('TENANT')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition ${
                        occupancyType === 'TENANT'
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>📜</span> Tenant / Renter
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PERSONAL IDENTITY */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>👤 2. Resident Profile</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Legal Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Abhishek Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. abhishek@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PRIVATE CREDENTIALS */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                    <span>🔐 3. Private Login Credentials</span>
                  </h3>
                  <span className="text-xs text-slate-400">Admin cannot view your password</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Private Username */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Choose Unique Username <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-sm">
                        @
                      </span>
                      <input
                        type="text"
                        placeholder="abhishek"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm font-mono text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Unique login handle (e.g. abhishek, adarsh)</p>
                  </div>

                  {/* Private Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Private Password <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Encrypted securely with BCrypt</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-bold transition shadow-xl shadow-emerald-500/20 disabled:opacity-50 text-base"
                >
                  {loading ? 'Submitting Application...' : 'Submit Registration for Admin Approval 🚀'}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">
                  Already registered and approved?{' '}
                  <Link to="/" className="text-emerald-400 font-semibold hover:underline">
                    Log in here
                  </Link>
                </span>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 py-4 border-t border-slate-800">
        Secure Smart Apartment & Society Management Platform • Dedicated Resident Identity & Privacy Protection
      </footer>
    </div>
  );
}
