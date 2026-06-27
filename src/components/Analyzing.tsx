import { useEffect, useRef, useState } from 'react';

const LINES = [
  'Estimating 1-rep maxes',
  'Adjusting for bodyweight',
  'Age-calibrating standards',
  'Ranking against population',
  'Computing DOTS',
];

const DURATION = 1500;

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** ~1.5s calibration overlay with cycling status lines + scrambling number (§2). */
export function Analyzing({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(0);
  const [num, setNum] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (prefersReduced()) {
      const t = setTimeout(() => doneRef.current(), 300);
      return () => clearTimeout(t);
    }
    const lineTimer = setInterval(
      () => setLine((l) => (l + 1) % LINES.length),
      DURATION / LINES.length,
    );
    const numTimer = setInterval(() => setNum(Math.floor(Math.random() * 1000)), 60);
    const finish = setTimeout(() => doneRef.current(), DURATION);
    return () => {
      clearInterval(lineTimer);
      clearInterval(numTimer);
      clearTimeout(finish);
    };
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
        Calibrating against 150M+ lifts
      </p>
      <div
        className="font-display my-6 text-7xl font-black tabular-nums text-text"
        style={{ textShadow: '0 0 40px rgba(255,122,46,0.35)' }}
        aria-hidden
      >
        {String(num).padStart(3, '0')}
      </div>
      <div className="h-6">
        <p key={line} className="ir-fade-up font-mono text-sm text-text2">
          {LINES[line]}…
        </p>
      </div>
      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent"
          style={{ animation: `ir-analyze ${DURATION}ms linear forwards` }}
        />
      </div>
      <style>{`@keyframes ir-analyze { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
