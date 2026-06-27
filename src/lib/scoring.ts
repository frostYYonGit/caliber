/**
 * CALIBER scoring engine (§4). Pure, unit-tested functions. All math in kg.
 *
 * Pipeline per lift:
 *   estimated 1RM (Epley) -> bodyweight ratio -> age-adjust -> compare to
 *   population-scaled standards -> percentile -> tier.
 * The composite Strength Score is the weighted mean of entered lift
 * percentiles, mapped to 0-1000.
 */
import {
  AGE_COEFF,
  PCT_EDGES,
  POP_MULT,
  STANDARDS,
  TIERS,
  WEIGHT,
  DOTS_MALE,
  DOTS_FEMALE,
  type LiftId,
  type Population,
  type Sex,
  type Tier,
  type TierRatios,
} from '../data/standards';

export const clamp = (x: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, x));

/* --------------------------------- 1RM (§4.1) --------------------------------- */

/** Epley estimated one-rep max. reps <= 1 is treated as a true max. */
export function oneRM(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + reps / 30);
}

/** The Epley multiplier, exposed so we can invert it for rank-up deltas. */
export const epleyFactor = (reps: number): number => (reps <= 1 ? 1 : 1 + reps / 30);

/* ----------------------------- Age coefficient (§4.3) ------------------------- */

const AGE_KEYS = Object.keys(AGE_COEFF)
  .map(Number)
  .sort((a, b) => a - b);

/** Fraction of peak strength at a given age (linear interpolation, clamped). */
export function ageCoeff(age: number): number {
  const a = clamp(age, AGE_KEYS[0], AGE_KEYS[AGE_KEYS.length - 1]);
  if (AGE_COEFF[a] !== undefined) return AGE_COEFF[a];
  let lo = AGE_KEYS[0];
  let hi = AGE_KEYS[AGE_KEYS.length - 1];
  for (let i = 0; i < AGE_KEYS.length - 1; i++) {
    if (a >= AGE_KEYS[i] && a <= AGE_KEYS[i + 1]) {
      lo = AGE_KEYS[i];
      hi = AGE_KEYS[i + 1];
      break;
    }
  }
  const f = (a - lo) / (hi - lo);
  return AGE_COEFF[lo] + f * (AGE_COEFF[hi] - AGE_COEFF[lo]);
}

/* ------------------------ Population-scaled thresholds (§4.4) ------------------ */

export function popMult(population: Population): number {
  return POP_MULT[population];
}

/** The effective start-of-tier ratios for a lift after sex + population. */
export function effectiveThresholds(
  sex: Sex,
  lift: LiftId,
  population: Population,
): TierRatios {
  const base = STANDARDS[sex][lift];
  const m = POP_MULT[population];
  return base.map((t) => t * m) as TierRatios;
}

/* ------------------------- Percentile + tier mapping (§4.5) ------------------- */

/** Piecewise-linear ratio -> percentile. Monotonic, clamped to [0, 99.9]. */
export function pctFromRatio(r: number, T: TierRatios): number {
  if (r <= 0) return 0;
  const edges = [0, T[0], T[1], T[2], T[3], T[4], T[4] * 1.3];
  for (let i = 0; i < edges.length - 1; i++) {
    if (r < edges[i + 1]) {
      const f = (r - edges[i]) / (edges[i + 1] - edges[i]);
      return clamp(PCT_EDGES[i] + f * (PCT_EDGES[i + 1] - PCT_EDGES[i]), 0, 99.9);
    }
  }
  return 99.9;
}

/** The highest tier whose lower percentile edge is <= p. */
export function tierFromPct(p: number): Tier {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (p >= PCT_EDGES[i]) idx = i;
  }
  return TIERS[idx];
}

/** Number of tier thresholds an (adjusted) ratio meets — 0=Untrained..5=World Class. */
function tierCount(adjustedRatio: number, T: TierRatios): number {
  let count = 0;
  for (const t of T) if (adjustedRatio >= t) count++;
  return count;
}

/* --------------------------------- Per-lift score ----------------------------- */

export interface ScoreContext {
  sex: Sex;
  age: number;
  bodyweightKg: number;
  population: Population;
}

export interface LiftEntry {
  id: LiftId;
  /** Lifted weight in kg (added load for weighted pull-up/dip). */
  weightKg: number;
  reps: number;
}

export interface LiftResult {
  id: LiftId;
  oneRMkg: number;
  /** Raw bodyweight ratio (what the card shows as "x BW"). */
  ratio: number;
  /** Age-adjusted ratio used for ranking. */
  adjustedRatio: number;
  percentile: number;
  tier: Tier;
}

export function scoreLift(entry: LiftEntry, ctx: ScoreContext): LiftResult {
  const oneRMkg = oneRM(entry.weightKg, entry.reps);
  const ratio = oneRMkg / ctx.bodyweightKg;
  const adjustedRatio = ratio / ageCoeff(ctx.age);
  const T = effectiveThresholds(ctx.sex, entry.id, ctx.population);
  const percentile = pctFromRatio(adjustedRatio, T);
  const tier = tierFromPct(percentile);
  return { id: entry.id, oneRMkg, ratio, adjustedRatio, percentile, tier };
}

/* ----------------------------- Composite score (§4.5) ------------------------- */

export interface Composite {
  overallPct: number;
  strengthScore: number;
  overallTier: Tier;
}

export function compositeScore(results: LiftResult[]): Composite {
  let wSum = 0;
  let acc = 0;
  for (const r of results) {
    const w = WEIGHT[r.id];
    wSum += w;
    acc += w * r.percentile;
  }
  const overallPct = wSum > 0 ? acc / wSum : 0;
  const strengthScore = Math.min(1000, Math.round(overallPct * 10));
  return { overallPct, strengthScore, overallTier: tierFromPct(overallPct) };
}

/* ----------------------------------- DOTS (§4.6) ------------------------------ */

/** DOTS relative-strength score. total + bodyweight in kg. */
export function dots(sex: Sex, totalKg: number, bodyweightKg: number): number {
  const c = sex === 'male' ? DOTS_MALE : DOTS_FEMALE;
  const x = bodyweightKg;
  const denom = c.a + c.b * x + c.c * x * x + c.d * x ** 3 + c.e * x ** 4;
  return (totalKg * 500) / denom;
}

/** DOTS interpretation band (same scale for men/women, §4.6). */
export function dotsLabel(score: number): string {
  if (score < 300) return 'Beginner';
  if (score < 400) return 'Novice';
  if (score < 450) return 'Intermediate';
  if (score < 500) return 'Advanced';
  if (score < 600) return 'Elite';
  return 'World Class';
}

/* ------------------------------- Closest rank-up (§5) ------------------------- */

export interface RankUp {
  id: LiftId;
  /** Additional weight needed in kg (same reps) to cross into the next tier. */
  deltaKg: number;
  nextTier: Tier;
}

/**
 * The cheapest single-lift gain that raises a tier: smallest positive weight
 * delta across entered lifts. Lifts already at World Class are skipped.
 */
export function closestRankUp(entries: LiftEntry[], ctx: ScoreContext): RankUp | null {
  let best: RankUp | null = null;
  const coeff = ageCoeff(ctx.age);
  for (const entry of entries) {
    const T = effectiveThresholds(ctx.sex, entry.id, ctx.population);
    const adjustedRatio = oneRM(entry.weightKg, entry.reps) / ctx.bodyweightKg / coeff;
    const count = tierCount(adjustedRatio, T);
    if (count >= 5) continue; // already World Class

    const nextThreshold = T[count];
    const neededOneRM = nextThreshold * coeff * ctx.bodyweightKg;
    const neededWeightKg = neededOneRM / epleyFactor(entry.reps);
    const deltaKg = neededWeightKg - entry.weightKg;
    if (deltaKg <= 0) continue;

    if (!best || deltaKg < best.deltaKg) {
      best = { id: entry.id, deltaKg, nextTier: TIERS[count + 1] };
    }
  }
  return best;
}
