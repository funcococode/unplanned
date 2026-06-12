export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-950/[0.06] dark:bg-white/[0.06] ${className}`}
      aria-hidden="true"
    />
  );
}

export function PageSpinner({ label = 'Plotting the route…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-night night-grid relative overflow-hidden">
      <div className="absolute w-[480px] h-[480px] rounded-full blur-3xl bg-orange-600/15 -top-40 left-1/2 -translate-x-1/2 pointer-events-none animate-pulse-glow" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-5">
        <span className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-orange-500/20" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin [animation-duration:0.9s] shadow-[0_0_20px_-4px_rgba(249,115,22,0.7)]" />
          <span className="h-2 w-2 rounded-full bg-orange-400" />
        </span>
        <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-zinc-950/55 dark:text-white/40">{label}</p>
      </div>
    </div>
  );
}
