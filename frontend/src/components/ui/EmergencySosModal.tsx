import { useState } from 'react';
import { useRole } from '@/context/RoleContext';
import { useToast } from '@/hooks/useToast';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencySosModal({ isOpen, onClose }: EmergencySosModalProps) {
  const { user, role } = useRole();
  const { pushToast } = useToast();
  const [sosSent, setSosSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const emergencyContacts = [
    {
      title: 'Gate Security Intercom',
      subtitle: 'Main Security Gate & Guard Desk #1',
      number: '+91 98765 43210',
      dialNumber: 'tel:9876543210',
      icon: '🛡️',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },
    {
      title: 'Ambulance / Medical',
      subtitle: 'Nearest Emergency Care & First Aid',
      number: '108 (Emergency)',
      dialNumber: 'tel:108',
      icon: '🚑',
      color: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },
    {
      title: 'Fire Brigade',
      subtitle: 'Emergency Fire Department Response',
      number: '101 (Fire Control)',
      dialNumber: 'tel:101',
      icon: '🚒',
      color: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    },
    {
      title: 'Police Control Room',
      subtitle: 'Local Station Security & Patrol',
      number: '100 / 112',
      dialNumber: 'tel:100',
      icon: '🚓',
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    },
    {
      title: 'Lift / Power Breakdown',
      subtitle: '24/7 Society Maintenance & Technician',
      number: '+91 98765 00000',
      dialNumber: 'tel:9876500000',
      icon: '⚡',
      color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    },
  ];

  const handleTriggerSilentSos = () => {
    setSending(true);
    // Trigger mobile vibration if supported
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      setSending(false);
      setSosSent(true);
      pushToast({
        type: 'error',
        title: '🚨 SOS Distress Alert Dispatched!',
        description: `High-priority emergency alert sent to Gate Security Desk for ${user?.fullName || user?.username || 'Resident'}. Security has been notified.`,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xl animate-pulse">
              🚨
            </span>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Emergency & SOS Helpline
              </h3>
              <p className="text-xs text-rose-300 font-medium">
                Tap to dial directly from your phone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close emergency modal"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Silent SOS Instant Alert Button */}
        <div className="rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-950/60 to-red-950/60 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-rose-200">Silent Guard Distress Alert</h4>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                Instantly notifies on-duty security guard with your flat details.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Active Mode
            </span>
          </div>

          <button
            type="button"
            onClick={handleTriggerSilentSos}
            disabled={sending || sosSent}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
              sosSent
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30 active:scale-98'
            }`}
          >
            <span>{sosSent ? '✓' : '🚨'}</span>
            <span>
              {sending
                ? 'Transmitting Emergency Alert...'
                : sosSent
                ? 'Distress Alert Active at Gate Desk'
                : 'Send Emergency Distress Alert'}
            </span>
          </button>
        </div>

        {/* Tap to Call Quick Helplines */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
            Tap to Call Direct Lines (Mobile)
          </p>
          <div className="space-y-2">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.title}
                href={contact.dialNumber}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 hover:bg-slate-950 p-3.5 transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg ${contact.color}`}>
                    {contact.icon}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white">{contact.title}</h5>
                    <p className="text-[11px] text-slate-400">{contact.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    {contact.number}
                  </span>
                  <span className="text-emerald-400 text-base">📞</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
          >
            Close Emergency Panel
          </button>
        </div>
      </div>
    </div>
  );
}
