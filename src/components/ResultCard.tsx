import { forwardRef, useEffect, useState } from 'react';
import { APP_NAME, HANDLE, shareHost } from '../config';
import { LIFT_BY_ID, TIER_COLOR, TIER_GLOW, TIER_VERDICT, isCompound } from '../data/standards';
import { ARCHETYPES, ARCHETYPE_SHOWCASE } from '../data/archetypes';
import { topPercent, type IronRankResult } from '../lib/result';
import { fromKg, roundWeight } from '../lib/units';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Count 0 -> target when `start` flips true. Static otherwise. */
function useCountUp(target: number, start: boolean, duration = 1000): number {
  const reduced = prefersReduced();
  const [val, setVal] = useState(start && !reduced ? 0 : target);
  useEffect(() => {
    if (reduced || !start) {
      setVal(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration, reduced]);
  return val;
}

function sexPhrase(result: IronRankResult): string {
  const sex = result.input.sex === 'male' ? 'male' : 'female';
  switch (result.input.population) {
    case 'general':
      return `${sex} adults`;
    case 'gym':
      return `${sex} lifters who lift`;
    case 'serious':
      return `serious ${sex} lifters`;
  }
}

const ROLL = ARCHETYPE_SHOWCASE.map((id) => ARCHETYPES[id].name);

interface Props {
  result: IronRankResult;
  animate?: boolean;
}

export const ResultCard = forwardRef<HTMLDivElement, Props>(function ResultCard(
  { result, animate = true },
  ref,
) {
  const { composite, input, dots, lifts, tracked, archetype } = result;
  const tier = composite.overallTier;
  const arch = archetype ? ARCHETYPES[archetype.id] : null;
  const color = arch ? arch.color : TIER_COLOR[tier];
  const glow = arch ? arch.glow : TIER_GLOW[tier];

  const shouldAnimate = animate && !prefersReduced();

  // Two-beat reveal: Beat 1 rolls the archetype name, Beat 2 fills score + bars.
  const [settled, setSettled] = useState(!(shouldAnimate && arch));
  const [rollIdx, setRollIdx] = useState(0);
  useEffect(() => {
    if (!(shouldAnimate && arch)) {
      setSettled(true);
      return;
    }
    setSettled(false);
    const roll = window.setInterval(() => setRollIdx((i) => i + 1), 70);
    const done = window.setTimeout(() => {
      window.clearInterval(roll);
      setSettled(true);
    }, 900);
    return () => {
      window.clearInterval(roll);
      window.clearTimeout(done);
    };
  }, [shouldAnimate, arch]);

  const score = useCountUp(composite.strengthScore, shouldAnimate && settled);

  const bwDisplay = `${roundWeight(fromKg(input.bodyweightKg, input.unit), input.unit)}${input.unit.toUpperCase()}`;
  const statsChip = `${input.sex === 'male' ? 'M' : 'F'} · ${input.age} · ${bwDisplay}`;
  const pct = Math.round(composite.overallPct);
  const topTxt = topPercent(composite.overallPct).toUpperCase();

  // Headline sizing: long single words ("POWERBUILDER") can't wrap, so shrink.
  const displayName = arch ? (settled ? arch.name : ROLL[rollIdx % ROLL.length]) : '';
  // Sized to the longest unwrappable word so "POWERBUILDER" never clips.
  const longestWord = displayName ? Math.max(...displayName.split(' ').map((w) => w.length)) : 0;
  const nameSize = longestWord >= 11 ? 33 : longestWord >= 9 ? 40 : 48;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        width: 392,
        background: `radial-gradient(135% 95% at 50% -12%, ${hexToRgba(color, glow * 0.55)} 0%, transparent 55%), linear-gradient(168deg, ${hexToRgba(color, 0.08)} 0%, #141519 42%, #0E0F12 100%)`,
        border: '1px solid var(--color-line)',
        borderRadius: 22,
        padding: 24,
        color: 'var(--color-text)',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />

      {/* Header */}
      <div className="mt-1 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold tracking-tight">
          {APP_NAME}
          <span style={{ color: 'var(--color-accent)' }}>.</span>
        </span>
        <span
          className="font-mono rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ background: 'var(--color-raised)', color: 'var(--color-text2)' }}
        >
          {statsChip}
        </span>
      </div>

      {arch ? (
        <>
          {/* Hero identity — name, tagline, percentile dominate; whitespace isolates it */}
          <div className="relative mt-7 mb-2 flex flex-col items-center text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                width: 392,
                height: 250,
                top: -24,
                background: `radial-gradient(circle at center, ${hexToRgba(color, glow)} 0%, transparent 66%)`,
              }}
            />
            {/* Archetype headline — the visual hero */}
            <div className="relative flex items-center justify-center gap-2.5" style={{ minHeight: 60 }}>
              {settled && (
                <span style={{ color, fontSize: 36, fontFamily: 'system-ui, sans-serif' }}>{arch.icon}</span>
              )}
              <span
                key={settled ? 'final' : rollIdx}
                className={`font-display text-center font-black uppercase leading-[0.92] ${settled ? 'ir-stamp' : ''}`}
                style={{ fontSize: nameSize, letterSpacing: '-0.02em', color: settled ? color : 'var(--color-text2)' }}
              >
                {displayName}
              </span>
            </div>

            {/* Tagline — subhead under the name */}
            <p className="font-display relative mt-2.5 text-2xl font-extrabold tracking-tight" style={{ color }}>
              {arch.tagline}
            </p>

            {/* Percentile verdict — the headline stat */}
            <p className="font-display relative mt-5 font-black capitalize leading-none" style={{ color, fontSize: '2.1rem' }}>
              {topTxt.toLowerCase()}
            </p>
            <p className="relative mt-1.5 text-sm text-text2">
              stronger than <span className="font-bold text-text">{pct}%</span> of {sexPhrase(result)}
            </p>

            {/* Rarity — reinforces the flex */}
            <p className="relative mt-2 text-[13px] text-text2">{arch.rarity}</p>

            {/* Trust badge */}
            <p className="font-mono relative mt-3 text-[10px] uppercase tracking-wide text-textmut">
              Based on Epley 1RM · bodyweight-adjusted · age-adjusted
            </p>
          </div>

          {/* Compact supporting stat — demoted */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-textmut">Strength Score {score}</span>
            {dots && (
              <>
                <span className="text-line">·</span>
                <span className="font-mono text-[10px] uppercase tracking-wide text-textmut">DOTS {Math.round(dots.score)}</span>
              </>
            )}
          </div>
        </>
      ) : (
        <TeaserHero
          result={result}
          score={score}
          color={color}
          glow={glow}
          sex={sexPhrase(result)}
          pct={pct}
        />
      )}

      <div className="my-4 h-px w-full" style={{ background: 'var(--color-line)' }} />

      {/* Per-lift breakdown — justifies the type */}
      <div className="flex flex-col gap-2.5">
        {lifts.map((l) => {
          const lc = TIER_COLOR[l.tier];
          return (
            <div key={l.id}>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-text">
                  {LIFT_BY_ID[l.id].name}
                </span>
                <span className="font-mono text-[10px] text-textmut">
                  <span style={{ color: lc }} className="font-bold">{l.tier}</span>
                  {'  ·  '}
                  {l.ratio.toFixed(2)}× BW
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-line)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: settled ? `${Math.max(2, Math.round(l.percentile))}%` : '0%',
                    background: lc,
                    transition: 'width 900ms cubic-bezier(0.2,0.8,0.2,1)',
                  }}
                />
              </div>
            </div>
          );
        })}

        {tracked.map((t) => (
          <div key={t.id} className="flex items-baseline justify-between opacity-70">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-text2">
              {LIFT_BY_ID[t.id].name}
            </span>
            <span className="font-mono text-[10px] text-textmut">
              tracked{'  ·  '}{t.ratio.toFixed(2)}× BW
            </span>
          </div>
        ))}
      </div>

      {/* Footer — the challenge + branding for reposts */}
      <div className="mt-3 border-t border-line pt-3">
        <p className="font-display text-center text-[15px] font-black tracking-tight" style={{ color }}>
          Beat my {composite.strengthScore}. → {shareHost()}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-display text-[11px] font-extrabold tracking-tight text-textmut">{APP_NAME}</span>
          <span className="font-mono text-[11px] text-textmut">{HANDLE}</span>
        </div>
      </div>
    </div>
  );
});

/** Fallback hero when only one of upper/lower was entered (no type yet). */
function TeaserHero({
  result,
  score,
  color,
  glow,
  sex,
  pct,
}: {
  result: IronRankResult;
  score: number;
  color: string;
  glow: number;
  sex: string;
  pct: number;
}) {
  const tier = result.composite.overallTier;
  const topLabel = topPercent(result.composite.overallPct);
  // Which region is missing → tailor the upsell (never a gate, just a nudge).
  const groups = new Set(
    result.lifts.filter((l) => isCompound(l.id)).map((l) => LIFT_BY_ID[l.id].group),
  );
  const needLeg = !groups.has('lower');
  const upsell = needLeg ? 'a leg lift' : 'a press or pull';
  return (
    <div className="relative mt-5 flex flex-col items-center text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ width: 360, height: 220, top: -20, background: `radial-gradient(circle at center, ${hexToRgba(color, glow)} 0%, transparent 66%)` }}
      />
      {/* Percentile verdict — the headline stat */}
      <p className="font-display relative text-5xl font-black capitalize leading-none" style={{ color }}>
        {topLabel}
      </p>
      {/* Tagline so the card is never a bare teaser (real tier verdict) */}
      <p className="font-display relative mt-2 text-base font-extrabold tracking-tight" style={{ color }}>
        {TIER_VERDICT[tier]}
      </p>
      <p className="relative mt-2 text-[13px] text-text2">
        stronger than <span className="font-bold text-text">{pct}%</span> of {sex}
      </p>
      <p className="font-mono relative mt-2 text-[10px] uppercase tracking-wide text-textmut">
        Based on Epley 1RM · bodyweight-adjusted · age-adjusted
      </p>

      {/* Secondary strip — score / tier demoted */}
      <div className="relative mt-3 flex items-center gap-2 rounded-xl border border-line px-3 py-2"
        style={{ background: hexToRgba(color, 0.05) }}>
        <span className="font-mono text-[10px] uppercase tracking-wide text-textmut">Score {score}</span>
        <span className="text-line">·</span>
        <span className="font-mono text-[10px] uppercase tracking-wide text-textmut">{tier}</span>
      </div>

      {/* Soft upsell — sharpens the read, never blocks it */}
      <p
        className="relative mt-3 rounded-lg px-3 py-2 text-[12px] text-text2"
        style={{ background: hexToRgba(color, 0.08), border: `1px solid ${hexToRgba(color, 0.35)}` }}
      >
        Add <span className="text-text">{upsell}</span> to reveal your Lifter Type.
      </p>
    </div>
  );
}
