import { useEffect, useState } from 'react';
import { parkingApi } from '@/services/communityApi';
import type { ParkingAllocation, Vehicle, VehicleRequest } from '@/types/community';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

export function ParkingPage() {
  const [allocations, setAllocations] = useState<ParkingAllocation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  const [form, setForm] = useState<VehicleRequest>({
    residentId: 1,
    vehicleNumber: '',
    make: '',
    model: '',
    color: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [allocRes, vehRes] = await Promise.all([
        parkingApi.getAllocations(0, 50),
        parkingApi.getVehicles(0, 50),
      ]);
      setAllocations(allocRes.data?.content || []);
      setVehicles(vehRes.data?.content || []);
    } catch {
      pushToast({ type: 'error', title: 'Failed to load parking data', description: 'Ensure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await parkingApi.createVehicle(form);
      pushToast({ type: 'success', title: 'Vehicle Registered', description: form.vehicleNumber });
      setShowVehicleModal(false);
      setForm({ residentId: 1, vehicleNumber: '', make: '', model: '', color: '' });
      loadData();
    } catch {
      pushToast({ type: 'error', title: 'Registration failed', description: 'Verify vehicle details.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAllocateSlot = async (vehicleId: number) => {
    try {
      await parkingApi.allocateParking(1, vehicleId);
      pushToast({ type: 'success', title: 'Parking Allocated', description: 'Assigned parking slot to vehicle.' });
      loadData();
    } catch {
      pushToast({ type: 'error', title: 'Allocation failed', description: 'No available parking slots found.' });
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TopBar title="Vehicle & Parking Management" subtitle="Register vehicles, allocate dedicated parking slots, and monitor occupancy status." />
        <button
          onClick={() => setShowVehicleModal(true)}
          className="self-start rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition-colors sm:self-auto"
        >
          + Register Vehicle
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* Registered Vehicles Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Registered Vehicles</span>
              <span className="rounded-full bg-cyan-500/20 text-cyan-300 px-3 py-0.5 text-xs font-semibold">{vehicles.length}</span>
            </h2>

            {vehicles.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-400">
                No resident vehicles registered yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((v) => (
                  <article key={v.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-base font-bold text-cyan-400">{v.vehicleNumber}</span>
                      <span className="text-xs text-slate-400">{v.color}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{v.make} {v.model}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <span className="text-slate-400">Owner: {v.residentName || `Resident #${v.residentId}`}</span>
                      <button
                        onClick={() => handleAllocateSlot(v.id)}
                        className="rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 px-3 py-1 font-medium text-cyan-300"
                      >
                        Auto-Allocate Slot
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Active Allocations Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Allocated Parking Slots</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-0.5 text-xs font-semibold">{allocations.length}</span>
            </h2>

            {allocations.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-400">
                No active parking slot allocations found.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allocations.map((a) => (
                  <article key={a.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider text-slate-400">Slot #{a.slotNumber || a.slotId}</span>
                      <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        OCCUPIED
                      </span>
                    </div>
                    <p className="text-lg font-bold text-white font-mono">{a.vehicleNumber || 'Assigned Vehicle'}</p>
                    <p className="text-xs text-slate-300">Allocated to: {a.residentName || `Resident #${a.residentId}`}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900 p-6 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Register Resident Vehicle</h2>
            <form onSubmit={handleRegisterVehicle} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Vehicle Plate Number</label>
                <input
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white font-mono uppercase outline-none focus:border-cyan-400"
                  value={form.vehicleNumber}
                  onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                  placeholder="KA-01-AB-1234"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Make</label>
                  <input
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.make}
                    onChange={(e) => setForm({ ...form, make: e.target.value })}
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Model</label>
                  <input
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="Fortuner"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Color</label>
                  <input
                    required
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="Black"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-cyan-400 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  {submitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
