import { forwardRef, useEffect, useState } from 'react';
import { APP_NAME, HANDLE, TAGLINE, shareHost } from '../config';
import { LIFT_BY_ID, POP_LABEL, TIER_COLOR, TIER_GLOW } from '../data/standards';
import { ARCHETYPES, ARCHETYPE_SHOWCASE } from '../data/archetypes';
import { telemetryLabel } from '../lib/classify';
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
  const { composite, input, dots, rankUp, lifts, tracked, archetype, ageAdjusted } = result;
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
  const longestWord = displayName ? Math.max(...displayName.split(' ').map((w) => w.length)) : 0;
  const nameSize = longestWord >= 9 ? 33 : 40;

  const rankUpText = rankUp
    ? `+${Math.ceil(roundWeight(fromKg(rankUp.deltaKg, input.unit), input.unit))}${input.unit.toUpperCase()} ${LIFT_BY_ID[rankUp.id].short} → ${rankUp.nextTier}`
    : null;

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
          {/* Glow behind the identity */}
          <div className="relative mt-6 flex flex-col items-center text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                width: 380,
                height: 220,
                top: -20,
                background: `radial-gradient(circle at center, ${hexToRgba(color, glow)} 0%, transparent 66%)`,
              }}
            />
            {/* Archetype headline — the hero */}
            <div
              className="relative flex items-center justify-center gap-2"
              style={{ minHeight: 56 }}
            >
              {settled && (
                <span style={{ color, fontSize: 30, fontFamily: 'system-ui, sans-serif' }}>
                  {arch.icon}
                </span>
              )}
              <span
                key={settled ? 'final' : rollIdx}
                className={`font-display text-center font-black uppercase leading-[0.95] ${settled ? 'ir-stamp' : ''}`}
                style={{
                  fontSize: nameSize,
                  letterSpacing: '-0.02em',
                  color: settled ? color : 'var(--color-text2)',
                }}
              >
                {displayName}
              </span>
            </div>

            {/* Telemetry */}
            <p className="font-mono relative mt-3 text-[11px] uppercase tracking-[0.18em] text-textmut">
              {telemetryLabel(archetype!, arch.telemetry)} · {tier} · {topTxt}
            </p>
            {/* Rarity */}
            <p className="relative mt-2 text-[13px] text-text2">{arch.rarity}</p>
            {/* Tagline */}
            <p className="font-display relative mt-3 text-xl font-extrabold tracking-tight" style={{ color }}>
              {arch.tagline}
            </p>
          </div>

          {/* Supporting stat row — score demoted but still molten */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-line bg-raised/40 px-3 py-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-textmut">
              Strength Score
            </span>
            <span className="font-display text-lg font-black tabular-nums" style={{ color }}>
              {score}
            </span>
            <span className="text-line">·</span>
            <span className="font-mono text-[11px] font-bold uppercase" style={{ color: TIER_COLOR[tier] }}>
              {tier}
            </span>
            {dots && (
              <>
                <span className="text-line">·</span>
                <span className="font-mono text-[11px] text-text2">DOTS {Math.round(dots.score)}</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="mt-4 text-center text-[13px] leading-relaxed text-text2">
            {arch.description}
          </p>

          {/* Flex / Flaw */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-surface px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-wide" style={{ color }}>
                Flex
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-text">{arch.flex}</p>
            </div>
            <div className="rounded-lg border border-line bg-surface px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-wide text-textmut">Flaw</p>
              <p className="mt-0.5 text-[12px] leading-snug text-text2">{arch.flaw}</p>
            </div>
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

      {rankUpText && (
        <div
          className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: hexToRgba('#FF7A2E', 0.08), border: '1px solid rgba(255,122,46,0.25)' }}
        >
          <span style={{ color: 'var(--color-accent)' }} className="text-sm font-bold">↑</span>
          <span className="text-[12px] text-text2">
            Next rank-up: <span className="font-mono font-bold text-text">{rankUpText}</span>
          </span>
        </div>
      )}

      {/* Rival */}
      {arch && (
        <p className="font-mono mt-3 text-center text-[11px] text-textmut">
          Your rival:{' '}
          <span className="font-bold" style={{ color: ARCHETYPES[arch.rival].color }}>
            {ARCHETYPES[arch.rival].name}
          </span>
          .
        </p>
      )}

      {/* Methodology */}
      <p className="font-mono mt-2 text-center text-[9px] leading-relaxed text-textmut">
        1RM via Epley · age- &amp; bodyweight-adjusted · ranked vs {POP_LABEL[input.population]}
        {ageAdjusted ? ` · age-adjusted (${input.age})` : ''}
      </p>

      {/* Footer — the invitation */}
      <div className="mt-3 border-t border-line pt-3">
        <p className="font-display text-center text-[15px] font-extrabold tracking-tight" style={{ color }}>
          {TAGLINE} → {shareHost()}
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
  return (
    <div className="relative mt-3 flex flex-col items-center text-center">
      <span
        className="font-display inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-extrabold uppercase tracking-wider"
        style={{ color, background: hexToRgba(color, 0.14), border: `1px solid ${hexToRgba(color, 0.55)}` }}
      >
        ★ {tier}
      </span>
      <div className="relative mt-2 flex flex-col items-center">
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{ width: 360, height: 220, top: -20, background: `radial-gradient(circle at center, ${hexToRgba(color, glow)} 0%, transparent 66%)` }}
        />
        <div className="font-display relative font-black tabular-nums leading-none" style={{ fontSize: 104, color, letterSpacing: '-0.05em' }}>
          {score}
        </div>
        <p className="font-mono relative mt-1 text-[11px] uppercase tracking-[0.3em] text-textmut">
          Strength Score / 1000
        </p>
      </div>
      <p className="mt-3 text-center text-[13px] text-text2">
        Stronger than <span className="font-bold" style={{ color }}>{pct}%</span> of {sex}
      </p>
      <p
        className="mt-3 rounded-lg px-3 py-2 text-[12px] text-text2"
        style={{ background: hexToRgba(color, 0.08), border: `1px solid ${hexToRgba(color, 0.35)}` }}
      >
        Enter a press <span className="text-text">and</span> a pull to reveal your Lifter Type.
      </p>
    </div>
  );
}
