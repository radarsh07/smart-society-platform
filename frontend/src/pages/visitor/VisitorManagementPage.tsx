import { type FormEvent, useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { residentApi, societyApi, visitorApi } from '@/services';
import type { ResidentSummaryResponse } from '@/types/society';
import type { ServiceProviderRequest, TrustedVisitorRequest, VisitorInvitationRequest } from '@/types/visitor';

export function VisitorManagementPage() {
  const [residents, setResidents] = useState<ResidentSummaryResponse[]>([]);
  const [societyId, setSocietyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const [invitationForm, setInvitationForm] = useState<VisitorInvitationRequest>({
    residentId: 0,
    visitorName: '',
    visitorPhone: '',
    visitorCompany: '',
    purpose: '',
  });

  const [trustedForm, setTrustedForm] = useState<TrustedVisitorRequest>({
    residentId: 0,
    visitorName: '',
    visitorPhone: '',
    visitorCompany: '',
    notes: '',
  });

  const [providerForm, setProviderForm] = useState<ServiceProviderRequest>({
    societyId: 0,
    providerName: '',
    serviceType: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      residentApi.listResidents(0, 50, 'createdAt', 'DESC').then(result => setResidents(result.content)),
      societyApi.getCurrentSociety().then(society => {
        setSocietyId(society.id);
        setProviderForm(current => ({ ...current, societyId: society.id }));
      }),
    ])
      .catch(() => pushToast({ type: 'error', title: 'Failed to load visitor setup data' }))
      .finally(() => setLoading(false));
  }, [pushToast]);

  async function handleInvitationSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await visitorApi.createInvitation(invitationForm);
      pushToast({ type: 'success', title: 'Invitation created' });
      setInvitationForm({ residentId: 0, visitorName: '', visitorPhone: '', visitorCompany: '', purpose: '' });
    } catch {
      pushToast({ type: 'error', title: 'Failed to create invitation' });
    }
  }

  async function handleTrustedSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await visitorApi.createTrustedVisitor(trustedForm);
      pushToast({ type: 'success', title: 'Trusted visitor saved' });
      setTrustedForm({ residentId: 0, visitorName: '', visitorPhone: '', visitorCompany: '', notes: '' });
    } catch {
      pushToast({ type: 'error', title: 'Failed to save trusted visitor' });
    }
  }

  async function handleProviderSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await visitorApi.createServiceProvider(providerForm);
      pushToast({ type: 'success', title: 'Service provider saved' });
      setProviderForm(current => ({ ...current, providerName: '', serviceType: '', contactPhone: '', contactEmail: '', notes: '' }));
    } catch {
      pushToast({ type: 'error', title: 'Failed to save service provider' });
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="space-y-8">
      <TopBar title="Visitor & Identity Access" subtitle="Issue visitor passes, manage trusted visitors, and register service providers." />
      <div className="grid gap-6 xl:grid-cols-3">
        <form onSubmit={handleInvitationSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Issue visitor invitation</h2>
          <div className="mt-4 space-y-3">
            <select className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" value={invitationForm.residentId} onChange={event => setInvitationForm(current => ({ ...current, residentId: Number(event.target.value) }))}>
              <option value={0}>Select resident</option>
              {residents.map(resident => (
                <option key={resident.id} value={resident.id}>{resident.fullName}</option>
              ))}
            </select>
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Visitor name" value={invitationForm.visitorName} onChange={event => setInvitationForm(current => ({ ...current, visitorName: event.target.value }))} />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Visitor phone" value={invitationForm.visitorPhone} onChange={event => setInvitationForm(current => ({ ...current, visitorPhone: event.target.value }))} />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Visitor company" value={invitationForm.visitorCompany ?? ''} onChange={event => setInvitationForm(current => ({ ...current, visitorCompany: event.target.value }))} />
            <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Purpose" value={invitationForm.purpose ?? ''} onChange={event => setInvitationForm(current => ({ ...current, purpose: event.target.value }))} />
          </div>
          <button className="mt-5 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950" type="submit">Create invitation</button>
        </form>

        <form onSubmit={handleTrustedSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Trusted visitors</h2>
          <div className="mt-4 space-y-3">
            <select className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" value={trustedForm.residentId} onChange={event => setTrustedForm(current => ({ ...current, residentId: Number(event.target.value) }))}>
              <option value={0}>Select resident</option>
              {residents.map(resident => (
                <option key={resident.id} value={resident.id}>{resident.fullName}</option>
              ))}
            </select>
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Visitor name" value={trustedForm.visitorName} onChange={event => setTrustedForm(current => ({ ...current, visitorName: event.target.value }))} />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Visitor phone" value={trustedForm.visitorPhone} onChange={event => setTrustedForm(current => ({ ...current, visitorPhone: event.target.value }))} />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Company" value={trustedForm.visitorCompany ?? ''} onChange={event => setTrustedForm(current => ({ ...current, visitorCompany: event.target.value }))} />
            <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Notes" value={trustedForm.notes ?? ''} onChange={event => setTrustedForm(current => ({ ...current, notes: event.target.value }))} />
          </div>
          <button className="mt-5 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950" type="submit">Save trusted visitor</button>
        </form>

        <form onSubmit={handleProviderSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Service providers</h2>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Provider name" value={providerForm.providerName} onChange={event => setProviderForm(current => ({ ...current, providerName: event.target.value }))} />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Service type" value={providerForm.serviceType} onChange={event => setProviderForm(current => ({ ...current, serviceType: event.target.value }))} />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Contact phone" value={providerForm.contactPhone} onChange={event => setProviderForm(current => ({ ...current, contactPhone: event.target.value }))} />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Contact email" value={providerForm.contactEmail ?? ''} onChange={event => setProviderForm(current => ({ ...current, contactEmail: event.target.value }))} />
            <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" placeholder="Notes" value={providerForm.notes ?? ''} onChange={event => setProviderForm(current => ({ ...current, notes: event.target.value }))} />
            <p className="text-sm text-slate-400">Society: {societyId ?? 'Loading...'}</p>
          </div>
          <button className="mt-5 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950" type="submit">Save provider</button>
        </form>
      </div>
    </section>
  );
}
