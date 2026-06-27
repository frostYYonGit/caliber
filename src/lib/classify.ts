/**
 * CALIBER Lifter Type classifier (Edit 2). Pure function over scored lift
 * results + the composite percentile.
 *
 * Ordered logic (first match wins):
 *   Specialist → Different Breed → Prospect → Glass Cannon → Mirror Athlete
 *   → The Mule → Powerbuilder.
 *
 * Only COMPOUND lifts drive the type (isolation lifts show a percentile but
 * never classify). A full type needs ≥1 UPPER compound AND ≥1 LOWER compound;
 * otherwise returns null and the UI shows a teaser.
 */
import { LIFT_BY_ID, WEIGHT, isCompound, type Group, type LiftId } from '../data/standards';
import type { ArchetypeId } from '../data/archetypes';
import type { LiftResult } from './scoring';

/* Thresholds — editorial draft, safe to tune. */
const SPECIALIST_MIN_LIFTS = 3; // need a few lifts before one can "stand out"
const SPECIALIST_STANDOUT_GAP = 25; // best must beat the *next* best by this much
const SPECIALIST_MIN_PCT = 65; // and be at least Advanced-ish itself
const DIFFERENT_BREED_MIN_OVERALL = 88;
const DIFFERENT_BREED_MAX_GAP = 18;
const PROSPECT_MAX_OVERALL = 35;
const PEAKED_GAP = 20; // |upper − lower| at/above this = peaked
const LEAN_GAP = 8; // and below this = balanced

const SPECIALIST_MAP: Partial<Record<LiftId, ArchetypeId>> = {
  deadlift: 'deadlift_demon',
  back_squat: 'squat_monster',
  bench_press: 'bench_boss',
  overhead_press: 'press_machine',
};

export type Lean = 'upper' | 'lower' | 'balanced';

export interface Classification {
  id: ArchetypeId;
  lean: Lean;
  upperPct: number;
  lowerPct: number;
}

function weightedMean(lifts: LiftResult[]): number {
  let w = 0;
  let acc = 0;
  for (const l of lifts) {
    const lw = WEIGHT[l.id] ?? 0.5;
    w += lw;
    acc += lw * l.percentile;
  }
  return w > 0 ? acc / w : 0;
}

const groupOf = (id: LiftId): Group => LIFT_BY_ID[id].group;

/** Classify a lifter, or null when an upper/lower compound is missing. */
export function classify(lifts: LiftResult[], overallPct: number): Classification | null {
  // Only compounds drive the type; isolation lifts are ignored here.
  const compounds = lifts.filter((l) => isCompound(l.id));
  const upper = compounds.filter((l) => groupOf(l.id) === 'upper');
  const lower = compounds.filter((l) => groupOf(l.id) === 'lower');
  if (upper.length === 0 || lower.length === 0) return null;

  const upperPct = weightedMean(upper);
  const lowerPct = weightedMean(lower);
  const gap = upperPct - lowerPct;
  const lean: Lean = gap >= LEAN_GAP ? 'upper' : gap <= -LEAN_GAP ? 'lower' : 'balanced';
  const base = { lean, upperPct, lowerPct };

  const sorted = [...compounds].sort((a, b) => b.percentile - a.percentile);
  const best = sorted[0];
  const second = sorted[1];

  // 1. Specialist — one named lift towering over the next best.
  if (
    compounds.length >= SPECIALIST_MIN_LIFTS &&
    SPECIALIST_MAP[best.id] &&
    best.percentile >= SPECIALIST_MIN_PCT &&
    second &&
    best.percentile - second.percentile >= SPECIALIST_STANDOUT_GAP
  ) {
    return { id: SPECIALIST_MAP[best.id]!, ...base };
  }

  // 2. Different Breed — elite and balanced.
  if (overallPct >= DIFFERENT_BREED_MIN_OVERALL && Math.abs(gap) <= DIFFERENT_BREED_MAX_GAP) {
    return { id: 'different_breed', ...base };
  }

  // 3. Prospect — still early (lean flavor preserved).
  if (overallPct < PROSPECT_MAX_OVERALL) {
    return { id: 'prospect', ...base };
  }

  // 4. Glass Cannon — upper peaked.
  if (gap >= PEAKED_GAP) {
    return { id: 'glass_cannon', ...base };
  }

  // 5. Mirror Athlete — upper lean.
  if (gap >= LEAN_GAP) {
    return { id: 'mirror_athlete', ...base };
  }

  // 6. The Mule — lower peaked.
  if (gap <= -PEAKED_GAP) {
    return { id: 'the_mule', ...base };
  }

  // 7. Powerbuilder — balanced / mild lower lean (fallback).
  return { id: 'powerbuilder', ...base };
}

/** Compose the final telemetry label (Prospect appends its lean). */
export function telemetryLabel(c: Classification, baseTelemetry: string): string {
  if (c.id === 'prospect' && c.lean !== 'balanced') {
    return `${baseTelemetry} · ${c.lean.toUpperCase()}-LEAN`;
  }
  return baseTelemetry;
}
