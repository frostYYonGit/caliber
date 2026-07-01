import { describe, it, expect } from 'vitest';
import {
  oneRM,
  scoreLift,
  dots,
  pctFromRatio,
  closestRankUp,
  effectiveThresholds,
  type ScoreContext,
} from './scoring';
import { topPercent } from './result';
import { isScored } from '../data/standards';

/** Pounds → kilograms (the engine works in kg; StrengthLevel benchmarks are lb). */
const LB = 0.45359237;
const lb = (x: number) => x * LB;

describe('oneRM (Epley §4.1)', () => {
  it('estimates a 5RM correctly', () => {
    expect(oneRM(100, 5)).toBeCloseTo(116.7, 1);
  });
  it('treats reps <= 1 as a true max', () => {
    expect(oneRM(140, 1)).toBe(140);
    expect(oneRM(140, 0)).toBe(140);
  });
});

/* ---------------------------------------------------------------------------
 * StrengthLevel benchmark matrix (the regression guard). Tiers + percentiles
 * are benchmarked to StrengthLevel's published per-bodyweight tables; the
 * DEFAULT "people who lift" population is calibrated to equal StrengthLevel.
 * ------------------------------------------------------------------------- */
describe('benchmark matrix vs StrengthLevel (default = gym)', () => {
  // THE BUG REPRO: 45F, 150 lb, bench 135×5 (~157 lb 1RM). StrengthLevel calls
  // this Intermediate (almost Advanced), ~79th. It must NOT be Elite/top-3%.
  it('45F / 150lb / bench 135×5 → Intermediate, ~79th (NOT Elite)', () => {
    const r = scoreLift(
      { id: 'bench_press', weightKg: lb(135), reps: 5 },
      { sex: 'female', age: 45, bodyweightKg: lb(150), population: 'gym' },
    );
    expect(r.tier).toBe('Intermediate');
    expect(r.percentile).toBeGreaterThan(73);
    expect(r.percentile).toBeLessThan(83);
    expect(r.tier).not.toBe('Elite');
    expect(r.tier).not.toBe('World Class');
  });

  // Same bench at peak age — female curve sanity-check (age must not swing it much).
  it('25F / 150lb / bench 135×5 → Intermediate, close to the 45yo result', () => {
    const r = scoreLift(
      { id: 'bench_press', weightKg: lb(135), reps: 5 },
      { sex: 'female', age: 25, bodyweightKg: lb(150), population: 'gym' },
    );
    expect(r.tier).toBe('Intermediate');
    expect(r.percentile).toBeGreaterThan(72);
    expect(r.percentile).toBeLessThan(82);
  });

  // Men weren't broken by the female fix: 225 bench at 200 lb is ~Novice (~40th)
  // per StrengthLevel — honest, not inflated.
  it('25M / 200lb / bench 225 → sensible male tier (Novice/Intermediate, not Advanced+)', () => {
    const r = scoreLift(
      { id: 'bench_press', weightKg: lb(225), reps: 1 },
      { sex: 'male', age: 25, bodyweightKg: lb(200), population: 'gym' },
    );
    expect(['Novice', 'Intermediate']).toContain(r.tier);
    expect(r.percentile).toBeGreaterThan(25);
    expect(r.percentile).toBeLessThan(55);
  });

  // Age isolation: the 45yo man must NOT be boosted into a higher tier than the
  // 25yo for the identical lift (the old curve over-boosted 40+).
  it('45M / 200lb / bench 225 → same tier as 25yo, only a few points higher', () => {
    const young = scoreLift(
      { id: 'bench_press', weightKg: lb(225), reps: 1 },
      { sex: 'male', age: 25, bodyweightKg: lb(200), population: 'gym' },
    );
    const older = scoreLift(
      { id: 'bench_press', weightKg: lb(225), reps: 1 },
      { sex: 'male', age: 45, bodyweightKg: lb(200), population: 'gym' },
    );
    expect(older.tier).toBe(young.tier);
    expect(older.percentile - young.percentile).toBeLessThan(6);
  });

  it('25F / 150lb / squat 185 → Intermediate (SL F150 squat: Int 168, Adv 231)', () => {
    const r = scoreLift(
      { id: 'back_squat', weightKg: lb(185), reps: 1 },
      { sex: 'female', age: 25, bodyweightKg: lb(150), population: 'gym' },
    );
    expect(r.tier).toBe('Intermediate');
  });

  it('25M / 200lb / squat 315 → Novice (SL M200 squat: Nov 248, Int 323)', () => {
    const r = scoreLift(
      { id: 'back_squat', weightKg: lb(315), reps: 1 },
      { sex: 'male', age: 25, bodyweightKg: lb(200), population: 'gym' },
    );
    expect(r.tier).toBe('Novice');
  });

  it('25F / 150lb / deadlift 225 → Intermediate (SL F150 DL: Int 197, Adv 267)', () => {
    const r = scoreLift(
      { id: 'deadlift', weightKg: lb(225), reps: 1 },
      { sex: 'female', age: 25, bodyweightKg: lb(150), population: 'gym' },
    );
    expect(r.tier).toBe('Intermediate');
  });

  it('25M / 200lb / deadlift 405 → Intermediate (SL M200 DL: Int 373, Adv 467)', () => {
    const r = scoreLift(
      { id: 'deadlift', weightKg: lb(405), reps: 1 },
      { sex: 'male', age: 25, bodyweightKg: lb(200), population: 'gym' },
    );
    expect(r.tier).toBe('Intermediate');
  });
});

describe('female standards are decoupled from male (the fixed bug)', () => {
  it('a 1.05x female bench is NOT Elite (it was, via the male×factor shortcut)', () => {
    const r = scoreLift(
      { id: 'bench_press', weightKg: lb(157.5), reps: 1 },
      { sex: 'female', age: 45, bodyweightKg: lb(150), population: 'gym' },
    );
    expect(r.tier).not.toBe('Elite');
  });
  it('female and male bench thresholds differ (not a fixed ratio)', () => {
    const m = effectiveThresholds('male', 'bench_press', 'serious');
    const f = effectiveThresholds('female', 'bench_press', 'serious');
    // If female were male × constant, every ratio would share one factor.
    const factors = m.map((v, i) => f[i] / v);
    const spread = Math.max(...factors) - Math.min(...factors);
    expect(spread).toBeGreaterThan(0.02);
  });
});

describe('population comparison ordering', () => {
  it('the same lift ranks higher vs general population than vs serious lifters', () => {
    const base = { id: 'bench_press' as const, weightKg: lb(225), reps: 1 };
    const ctx = { sex: 'male' as const, age: 30, bodyweightKg: lb(200) };
    const general = scoreLift(base, { ...ctx, population: 'general' });
    const gym = scoreLift(base, { ...ctx, population: 'gym' });
    const serious = scoreLift(base, { ...ctx, population: 'serious' });
    expect(general.percentile).toBeGreaterThan(gym.percentile);
    expect(gym.percentile).toBeGreaterThan(serious.percentile);
  });
});

describe('tracked-not-scored (Option A — honesty)', () => {
  it('common lifts are scored (expanded coverage — barbell / machine / dumbbell / cable)', () => {
    for (const id of [
      'bench_press', 'back_squat', 'deadlift', 'lat_pulldown', 'leg_press',
      'hack_squat', 'hip_thrust', 'leg_extension', 'leg_curl', 'machine_chest_press',
      'machine_shoulder_press', 't_bar_row', 'barbell_curl', 'tricep_pushdown',
      'lateral_raise', 'sumo_deadlift',
    ]) {
      expect(isScored(id)).toBe(true);
    }
  });
  it('lifts with no real published standard stay tracked-only (honesty floor)', () => {
    for (const id of ['face_pull', 'smith_machine_squat', 'goblet_squat', 'arnold_press', 'deficit_deadlift']) {
      expect(isScored(id)).toBe(false);
    }
  });
});

describe('DOTS (§4.6) — unchanged formula', () => {
  it('male, 90kg BW, 500kg total → ~323 (IPF formula)', () => {
    const d = dots('male', 500, 90);
    expect(d).toBeCloseTo(323.3, 0);
  });
  it('female coefficients produce a sane, finite factor', () => {
    const f = dots('female', 300, 60);
    expect(f).toBeGreaterThan(0);
    expect(Number.isFinite(f)).toBe(true);
  });
});

describe('pctFromRatio — monotonic & clamped', () => {
  const T = effectiveThresholds('male', 'back_squat', 'serious');
  it('clamps to [0, 99.9]', () => {
    expect(pctFromRatio(-1, T)).toBe(0);
    expect(pctFromRatio(0, T)).toBe(0);
    expect(pctFromRatio(1000, T)).toBe(99.9);
  });
  it('is non-decreasing across the domain', () => {
    let prev = -1;
    for (let r = 0; r <= 6; r += 0.05) {
      const p = pctFromRatio(r, T);
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
  });
});

describe('topPercent — the flex framing', () => {
  it('inverts a percentile into "top X%"', () => {
    expect(topPercent(82)).toBe('top 18%');
    expect(topPercent(50)).toBe('top 50%');
  });
  it('keeps the top sliver precise', () => {
    expect(topPercent(99.9)).toBe('top 0.1%');
  });
});

describe('closestRankUp (§5)', () => {
  const ctx: ScoreContext = {
    sex: 'male',
    age: 30,
    bodyweightKg: lb(200),
    population: 'gym',
  };
  it('finds a positive single-lift gain into the next tier', () => {
    const up = closestRankUp(
      [
        { id: 'bench_press', weightKg: lb(225), reps: 1 },
        { id: 'back_squat', weightKg: lb(315), reps: 1 },
      ],
      ctx,
    );
    expect(up).not.toBeNull();
    expect(up!.deltaKg).toBeGreaterThan(0);
    expect(['bench_press', 'back_squat']).toContain(up!.id);
  });
});
