import { useEffect, useRef, useState } from 'react';
import { APP_NAME, HANDLE, shareHost } from '../config';

/**
 * The landing hero: a real-looking result card that auto-cycles through
 * archetypes. It is DELIBERATELY not the live ResultCard — that would pull the
 * scoring engine and html-to-image onto the landing's critical path (P0: speed).
 * This is hand-rolled CSS with hardcoded sample data so the landing chunk stays
 * tiny. It shows both the *format* (here's what you get) and the *variety*
 * (which type am I?). Fixed height = zero layout shift while it cycles.
 */
interface Sample {
  name: string;
  icon: string;
  color: string;
  glow: number;
  tagline: string;
  top: string;
  rarity: string;
  /** Breakdown bar fills (0–1) for press / pull / legs — for format realism. */
  bars: [number, number, number];
}

const SAMPLES: Sample[] = [
  {
    name: 'Different Breed',
    icon: '★',
    color: '#FFD45E',
    glow: 0.6,
    tagline: 'Strong everywhere. Quietly unfair.',
    top: 'Top 1%',
    rarity: '1% of lifters',
    bars: [0.92, 0.95, 0.9],
  },
  {
    name: 'Glass Cannon',
    icon: '▲',
    color: '#5FD0E6',
    glow: 0.5,
    tagline: 'All press. No foundation.',
    top: 'Top 8%',
    rarity: '6% of lifters',
    bars: [0.93, 0.62, 0.34],
  },
  {
    name: 'The Mule',
    icon: '▼',
    color: '#E8A14E',
    glow: 0.5,
    tagline: 'Pulls everything. Presses nothing.',
    top: 'Top 11%',
    rarity: '7% of lifters',
    bars: [0.36, 0.9, 0.82],
  },
  {
    name: 'Mirror Athlete',
    icon: '▲',
    color: '#C9B6FF',
    glow: 0.46,
    tagline: 'Built top-down.',
    top: 'Top 14%',
    rarity: '12% of lifters',
    bars: [0.84, 0.7, 0.58],
  },
];

const BAR_LABELS = ['PRESS', 'PULL', 'LEGS'];

export function LandingCard() {
  const [i, setI] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    try {
      reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* default to motion on */
    }
    if (reduced.current) return;
    const t = setInterval(() => setI((p) => (p + 1) % SAMPLES.length), 2600);
    return () => clearInterval(t);
  }, []);

  const s = SAMPLES[i];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[var(--radius-card)] border"
      style={{
        borderColor: `${s.color}40`,
        background: `radial-gradient(120% 80% at 50% -20%, ${hexA(s.color, 0.16 * s.glow)}, transparent 55%), var(--color-surface)`,
        boxShadow: `0 0 0 1px ${hexA(s.color, 0.08)}, 0 18px 50px -20px ${hexA(s.color, 0.5 * s.glow)}`,
        transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
      }}
    >
      <div className="flex flex-col gap-2.5 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-display text-[15px] font-black tracking-tight text-text">
            {APP_NAME}
            <span className="text-accent">.</span>
          </p>
          <span className="font-mono rounded-md border border-line bg-raised px-2 py-1 text-[10px] font-bold text-textmut">
            M · 24 · 84KG
          </span>
        </div>

        {/* Cycling identity block — fixed min-height kills layout shift */}
        <div key={i} className="ir-fade-up flex flex-col items-center text-center" style={{ minHeight: 138 }}>
          <span className="text-2xl leading-none" style={{ color: s.color }}>
            {s.icon}
          </span>
          <p className="font-mono mt-1.5 text-[10px] uppercase tracking-[0.25em] text-textmut">Lifter Type</p>
          <h3
            className="font-display mt-1 text-[28px] font-black leading-[0.95] tracking-[-0.02em]"
            style={{ color: s.color }}
          >
            {s.name}
          </h3>
          <p className="mt-1 text-[13px] leading-snug text-text2">{s.tagline}</p>
          <p className="font-display mt-2.5 text-[30px] font-black leading-none text-text">{s.top}</p>
          <p className="font-mono mt-1 text-[11px] uppercase tracking-wide text-textmut">{s.rarity}</p>
        </div>

        {/* Breakdown bars — shows the format */}
        <div className="flex flex-col gap-1.5">
          {s.bars.map((fill, b) => (
            <div key={b} className="flex items-center gap-2">
              <span className="font-mono w-10 shrink-0 text-[9px] uppercase tracking-wide text-textmut">
                {BAR_LABELS[b]}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.round(fill * 100)}%`, background: s.color, transition: 'width 0.6s ease' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer brand */}
        <div className="mt-1 flex items-center justify-between border-t border-line pt-2.5">
          <span className="font-mono text-[10px] font-bold text-textmut">{shareHost()}</span>
          <span className="font-mono text-[10px] text-textmut">{HANDLE}</span>
        </div>
      </div>
    </div>
  );
}

/** #RRGGBB + alpha → rgba() string (kept local so the chunk has no deps). */
function hexA(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
