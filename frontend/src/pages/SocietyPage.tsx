import { useEffect, useState } from 'react';
import { societyApi } from '@/services';
import type { SocietyRequest, SocietyResponse } from '@/types/society';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

const emptyForm: SocietyRequest = {
  societyName: '',
  registrationNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  contactPhone: '',
  contactEmail: '',
};

export function SocietyPage() {
  const [form, setForm] = useState<SocietyRequest>(emptyForm);
  const [society, setSociety] = useState<SocietyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    societyApi.getCurrentSociety().then(setSociety).catch(() => setSociety(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (society) {
      setForm({
        societyName: society.societyName,
        registrationNumber: society.registrationNumber ?? '',
        addressLine1: society.addressLine1,
        addressLine2: society.addressLine2 ?? '',
        city: society.city,
        state: society.state,
        pincode: society.pincode,
        contactPhone: society.contactPhone ?? '',
        contactEmail: society.contactEmail ?? '',
      });
    }
  }, [society]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: SocietyRequest = {
        societyName: form.societyName.trim(),
        registrationNumber: form.registrationNumber?.trim() || undefined,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2?.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        contactPhone: form.contactPhone?.trim() || undefined,
        contactEmail: form.contactEmail?.trim() || undefined,
      };

      const saved = society?.id ? await societyApi.updateSociety(society.id, payload) : await societyApi.createSociety(payload);
      setSociety(saved);
      pushToast({ type: 'success', title: 'Society saved', description: saved.societyName });
    } catch (err: any) {
      let description = 'Check the backend API and validation rules.';
      if (err?.response?.data?.fieldErrors && Array.isArray(err.response.data.fieldErrors)) {
        description = err.response.data.fieldErrors.map((f: any) => `${f.field}: ${f.message}`).join(', ');
      } else if (err?.response?.data?.message) {
        description = err.response.data.message;
      } else if (err?.message) {
        description = err.message;
      }
      pushToast({ type: 'error', title: 'Save failed', description });
    } finally {
      setSaving(false);
    }
  }

  const formFields = [
    { key: 'societyName', label: 'Society Name *', required: true, placeholder: 'e.g. Royal Heights Co-Op Housing Society' },
    { key: 'registrationNumber', label: 'Registration Number', required: false, placeholder: 'e.g. HSG-NM-2021-9988' },
    { key: 'addressLine1', label: 'Address Line 1 *', required: true, placeholder: 'e.g. 77 Palm Beach Road' },
    { key: 'addressLine2', label: 'Address Line 2', required: false, placeholder: 'e.g. Sector 15, Vashi' },
    { key: 'city', label: 'City *', required: true, placeholder: 'e.g. Navi Mumbai' },
    { key: 'state', label: 'State *', required: true, placeholder: 'e.g. Maharashtra' },
    { key: 'pincode', label: 'Pincode *', required: true, placeholder: 'e.g. 400703' },
    { key: 'contactPhone', label: 'Contact Phone', required: false, placeholder: 'e.g. +91 22 2789 4455' },
    { key: 'contactEmail', label: 'Contact Email', required: false, placeholder: 'e.g. admin@royalheights.org' },
  ];

  return (
    <section>
      <TopBar title="Society Master" subtitle="Manage society details, registration, and addresses stored in MySQL." />
      {loading ? <LoadingSpinner /> : null}
      {!loading && society ? (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Metric label="Buildings" value={society.buildingCount} />
          <Metric label="Flats" value={society.flatCount} />
          <Metric label="Registration" value={society.registrationNumber ?? 'N/A'} />
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-2">
        {formFields.map(({ key, label, required, placeholder }) => (
          <label key={key} className="flex flex-col gap-2 text-sm text-slate-300 md:col-span-1">
            <span className="font-medium text-slate-300">{label}</span>
            <input
              required={required}
              placeholder={placeholder}
              type={key === 'contactEmail' ? 'email' : 'text'}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400 transition-colors"
              value={(form[key as keyof SocietyRequest] as string) || ''}
              onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))}
            />
          </label>
        ))}
        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            className="rounded-2xl bg-cyan-400 hover:bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition-colors disabled:opacity-60 shadow-lg shadow-cyan-500/20"
            disabled={saving}
          >
            {saving ? 'Saving to Database...' : society?.id ? 'Update Society Master' : 'Create Society Master'}
          </button>
        </div>
      </form>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </article>
  );
}