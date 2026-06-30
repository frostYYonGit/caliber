import type { ButtonHTMLAttributes, ReactNode } from 'react';

/* ------------------------------- Step scaffolding ----------------------------- */

export function StepShell({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="ir-fade-up flex flex-col">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{kicker}</p>
      <h2 className="font-display mt-2 text-3xl font-extrabold leading-tight text-text">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-sm text-text2">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

/* --------------------------------- Buttons ----------------------------------- */

export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'flex h-13 w-full items-center justify-center rounded-xl px-5 text-base font-bold ' +
        'transition-colors disabled:cursor-not-allowed ' +
        'bg-accent text-[#0E0F12] hover:bg-[#ff8a45] ' +
        'disabled:bg-raised disabled:text-textmut ' +
        (props.className ?? '')
      }
      style={{ minHeight: 52, ...props.style }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'flex h-11 items-center justify-center rounded-xl border border-line px-4 ' +
        'text-sm font-semibold text-text2 transition-colors hover:border-textmut hover:text-text ' +
        (props.className ?? '')
      }
    >
      {children}
    </button>
  );
}

/* ----------------------------- Segmented control ------------------------------ */

export interface SegOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
  ariaLabel,
}: {
  options: SegOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
  columns?: number;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={
              'flex min-h-[56px] flex-col items-center justify-center rounded-xl border px-3 py-3 ' +
              'text-center transition-all ' +
              (selected
                ? 'border-accent bg-accent/10 text-text'
                : 'border-line bg-raised text-text2 hover:border-textmut hover:text-text')
            }
          >
            <span className="text-base font-semibold leading-tight">{opt.label}</span>
            {opt.hint && (
              <span className="mt-1 text-[11px] leading-snug text-textmut">{opt.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- Big number input --------------------------- */

export function BigNumberInput({
  value,
  onChange,
  unit,
  placeholder,
  autoFocus,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
  autoFocus?: boolean;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center rounded-2xl border border-line bg-raised px-5 focus-within:border-accent">
      <input
        type="number"
        inputMode="decimal"
        aria-label={ariaLabel}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="font-display w-full bg-transparent py-4 text-4xl font-extrabold text-text outline-none placeholder:text-textmut/50"
      />
      {unit && (
        <span className="font-mono ml-2 shrink-0 text-lg font-bold uppercase text-textmut">
          {unit}
        </span>
      )}
    </div>
  );
}
