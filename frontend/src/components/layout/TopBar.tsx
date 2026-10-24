interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="mb-4 sm:mb-6 flex flex-col gap-2 rounded-2xl lg:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 lg:px-6 lg:py-5 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-0.5 sm:mt-1 text-xs lg:text-sm text-slate-400 leading-relaxed">{subtitle}</p> : null}
      </div>
      <div className="hidden sm:inline-flex self-start lg:self-auto rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400">
        Single Society Deployment
      </div>
    </header>
  );
}
