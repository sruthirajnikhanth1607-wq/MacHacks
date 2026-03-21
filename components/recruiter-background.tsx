/** Shared ambient glow + grid used on splash and analyze pages */
export function RecruiterBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-violet-600/30 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[90px]"
      />
      <div
        aria-hidden
        className="splash-grid pointer-events-none absolute inset-0 opacity-[0.35]"
      />
    </>
  );
}
