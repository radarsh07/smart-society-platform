interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="mb-6 flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Single Society Deployment</div>
    </header>
  );
}
