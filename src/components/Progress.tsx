import { APP_NAME } from '../config';

/** Molten fill on a steel track. Advances across the input steps (§2). */
export function Progress({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-sm font-extrabold tracking-tight text-text">
        {APP_NAME}
        <span className="text-accent">.</span>
      </span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            boxShadow: '0 0 12px rgba(255,122,46,0.6)',
          }}
        />
      </div>
      <span className="font-mono w-10 shrink-0 text-right text-xs text-textmut">
        {step + 1}/{total}
      </span>
    </div>
  );
}
