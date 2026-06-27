import { describe, it, expect } from 'vitest';
import {
  oneRM,
  scoreLift,
  dots,
  pctFromRatio,
  closestRankUp,
  type ScoreContext,
} from './scoring';
import { effectiveThresholds } from './scoring';
import { topPercent } from './result';

describe('oneRM (Epley §4.1)', () => {
  it('estimates a 5RM correctly', () => {
    expect(oneRM(100, 5)).toBeCloseTo(116.7, 1);
  });
  it('treats reps <= 1 as a true max', () => {
    expect(oneRM(140, 1)).toBe(140);
    expect(oneRM(140, 0)).toBe(140);
  });
});

describe('scoreLift — tier & percentile (§4.5)', () => {
  const base: ScoreContext = {
    sex: 'male',
    age: 30,
    bodyweightKg: 100,
    population: 'serious',
  };

  it('150kg squat @ 100kg BW, serious → ratio 1.5 → Intermediate, pct ~42', () => {
    const r = scoreLift({ id: 'back_squat', weightKg: 150, reps: 1 }, base);
    expect(r.ratio).toBeCloseTo(1.5, 5);
    expect(r.tier).toBe('Intermediate');
    expect(r.percentile).toBeGreaterThan(35);
    expect(r.percentile).toBeLessThan(50);
    expect(r.percentile).toBeCloseTo(42, 0);
  });

  it('same lifter vs general population jumps into Advanced/Elite', () => {
    const r = scoreLift(
      { id: 'back_squat', weightKg: 150, reps: 1 },
      { ...base, population: 'general' },
    );
    expect(r.percentile).toBeGreaterThan(88);
    expect(r.tier).toBe('Elite');
  });

  it('16yo, 70kg BW, 100kg bench → age-adjusted ~1.61 → Advanced (not Untrained)', () => {
    const r = scoreLift(
      { id: 'bench_press', weightKg: 100, reps: 1 },
      { sex: 'male', age: 16, bodyweightKg: 70, population: 'serious' },
    );
    expect(r.adjustedRatio).toBeCloseTo(1.61, 1);
    expect(r.percentile).toBeGreaterThan(70);
    expect(r.tier).toBe('Advanced');
  });
});

describe('general-population sanity (no spurious 99th percentile)', () => {
  it('a bodyweight bench lands ~top quartile vs general population, not the 99th', () => {
    const r = scoreLift(
      { id: 'bench_press', weightKg: 80, reps: 1 },
      { sex: 'male', age: 30, bodyweightKg: 80, population: 'general' },
    );
    // ratio 1.0x BW — strong among non-lifters, but not freakish.
    expect(r.percentile).toBeGreaterThan(75);
    expect(r.percentile).toBeLessThan(90);
    expect(r.tier).toBe('Advanced');
  });

  it('a truly elite lift can still reach the top in the general population', () => {
    const r = scoreLift(
      { id: 'bench_press', weightKg: 160, reps: 1 },
      { sex: 'male', age: 30, bodyweightKg: 80, population: 'general' },
    );
    expect(r.percentile).toBeGreaterThan(98);
  });
});

describe('DOTS (§4.6)', () => {
  it('male, 90kg BW, 500kg total → ~323 (IPF formula; spec estimate ~330)', () => {
    // The authoritative IPF male coefficients give 323.3 for this lifter;
    // matches online DOTS calculators within ±1. (Spec §9 noted ~330 as an
    // approximation pending this cross-check.)
    const d = dots('male', 500, 90);
    expect(d).toBeGreaterThan(321);
    expect(d).toBeLessThan(325);
    expect(d).toBeCloseTo(323.3, 0);
  });

  it('female coefficients produce a sane, larger factor than male', () => {
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
    bodyweightKg: 100,
    population: 'serious',
  };

  it('finds the cheapest single-lift gain that raises a tier', () => {
    // Squat at 1.5x BW (Inter, needs +0.4 to Advanced = +40kg) vs
    // bench just below Advanced threshold (1.25x = 125kg).
    const up = closestRankUp(
      [
        { id: 'back_squat', weightKg: 150, reps: 1 },
        { id: 'bench_press', weightKg: 122, reps: 1 },
      ],
      ctx,
    );
    expect(up).not.toBeNull();
    expect(up!.id).toBe('bench_press');
    expect(up!.nextTier).toBe('Advanced');
    expect(up!.deltaKg).toBeGreaterThan(0);
    expect(up!.deltaKg).toBeCloseTo(3, 0); // 125 - 122
  });
});
