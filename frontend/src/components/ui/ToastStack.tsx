import { useToast } from '@/hooks/useToast';

export function ToastStack() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
            toast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-50'
              : toast.type === 'error'
                ? 'border-rose-500/30 bg-rose-500/15 text-rose-50'
                : 'border-sky-500/30 bg-sky-500/15 text-sky-50'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm opacity-90">{toast.description}</p> : null}
            </div>
            <button className="text-xs opacity-80 transition hover:opacity-100" onClick={() => removeToast(toast.id)}>
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
