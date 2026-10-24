import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { residentApi } from '@/services';
import type { ResidentResponse } from '@/types/society';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRole } from '@/context/RoleContext';

export function ResidentDetailsPage() {
  const { residentId } = useParams();
  const { role } = useRole();
  const isAdmin = role === 'ADMIN';

  const [resident, setResident] = useState<ResidentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!residentId) return;
    residentApi.getResident(Number(residentId))
      .then(setResident)
      .finally(() => setLoading(false));
  }, [residentId]);

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-6">
      <TopBar
        title="Resident Profile Details"
        subtitle="Complete resident record mapped to society building and flat unit."
      />

      {resident ? (
        <article className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">Resident ID #{resident.id}</span>
                <span className="text-[10px] text-slate-500 font-mono">User ID #{resident.userId}</span>
                {resident.username && (
                  <span className="text-xs text-cyan-300 font-mono font-bold bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    @{resident.username}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
                {resident.fullName}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {resident.email} • {resident.phoneNumber}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                🏢 {resident.buildingName}
              </span>
              <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
                🚪 Flat {resident.flatNumber}
              </span>
              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                {resident.residentStatus}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Portal Username" value={resident.username ? `@${resident.username}` : 'N/A'} icon="🔑" />
            <Field label="Building" value={resident.buildingName} icon="🏢" />
            <Field label="Flat / Unit" value={`Flat ${resident.flatNumber}`} icon="🚪" />
            <Field label="Occupancy Type" value={resident.occupancyType} icon="🏷️" />
            <Field label="Resident Status" value={resident.residentStatus} icon="🟢" />
            <Field label="Email Address" value={resident.email} icon="📧" />
            <Field label="Phone Number" value={resident.phoneNumber} icon="📞" />
            <Field label="Gender" value={resident.gender || 'Not specified'} icon="👤" />
            <Field label="Date of Birth" value={resident.dateOfBirth || 'Not specified'} icon="🎂" />
            <Field label="Blood Group" value={resident.bloodGroup || 'Not specified'} icon="🩸" />
            <Field label="Occupation" value={resident.occupation || 'Not specified'} icon="💼" />
            <Field label="Government ID" value={resident.governmentIdNumber || 'Not specified'} icon="🪪" />
            <Field label="Move-in Date" value={resident.moveInDate || 'Not specified'} icon="📅" />
            <Field label="Emergency Contact" value={resident.emergencyContactName ? `${resident.emergencyContactName} (${resident.emergencyContactPhone || 'No phone'})` : 'Not specified'} icon="🚨" />
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            {isAdmin && (
              <Link
                className="rounded-2xl bg-cyan-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-400/20"
                to={`/residents/${resident.id}/edit`}
              >
                ✏️ Edit Profile
              </Link>
            )}
            <Link
              className="rounded-2xl border border-white/10 bg-slate-800/80 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700/80 transition-all"
              to="/residents"
            >
              ← Back to Directory
            </Link>
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center text-slate-400">
          Resident not found.
        </div>
      )}
    </section>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-white break-words">{value || 'N/A'}</p>
    </div>
  );
}