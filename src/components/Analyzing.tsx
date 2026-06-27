import { useEffect, useRef, useState } from 'react';
import { useQuiz } from '../state/QuizContext';
import { POP_LABEL } from '../data/standards';

const DURATION = 1600;

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Calibration overlay → personalized build beat, ending on "Found your type." */
export function Analyzing({ onDone }: { onDone: () => void }) {
  const { state } = useQuiz();
  const pop = state.population ? POP_LABEL[state.population] : 'the field';

  const LINES = [
    'Estimating your 1-rep maxes',
    'Age-calibrating your numbers',
    `Reading your lifts against ${pop}`,
    'Found your type',
  ];

  const [line, setLine] = useState(0);
  const [num, setNum] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (prefersReduced()) {
      const t = setTimeout(() => doneRef.current(), 300);
      return () => clearTimeout(t);
    }
    // Progress through the lines (clamped) so it lands on "Found your type."
    const lineTimer = setInterval(
      () => setLine((l) => Math.min(l + 1, LINES.length - 1)),
      DURATION / LINES.length,
    );
    const numTimer = setInterval(() => setNum(Math.floor(Math.random() * 1000)), 60);
    const finish = setTimeout(() => doneRef.current(), DURATION);
    return () => {
      clearInterval(lineTimer);
      clearInterval(numTimer);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const last = line === LINES.length - 1;

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
        <p
          key={line}
          className="ir-fade-up font-mono text-sm"
          style={{ color: last ? 'var(--color-accent)' : 'var(--color-text2)' }}
        >
          {LINES[line]}
          {last ? '' : '…'}
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
