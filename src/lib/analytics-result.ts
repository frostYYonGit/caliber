/**
 * Result/share event property builders. Kept OUT of analytics.ts so the landing
 * chunk's analytics core stays free of the lift-standards and archetype data
 * tables (P0: speed) — only the funnel and result routes import these.
 */
import { ARCHETYPES } from '../data/archetypes';
import { LIFT_BY_ID } from '../data/standards';
import type { IronRankResult } from './result';

type Props = Record<string, unknown>;

/** Shared property bag for the result/share events, derived from the result. */
export function resultEventProps(result: IronRankResult): Props {
  try {
    const { composite, input, lifts, bestLift, archetype } = result;
    const byPct = [...lifts].sort((a, b) => a.percentile - b.percentile);
    const weakest = byPct[0];
    const entered = new Set(input.entries.map((e) => e.id));
    return {
      archetype: archetype ? ARCHETYPES[archetype.id].name : 'none',
      strength_score: composite.strengthScore,
      percentile: Math.round(composite.overallPct),
      tier: composite.overallTier,
      sex: input.sex,
      age: input.age,
      bodyweight: Math.round(input.bodyweightKg),
      units: input.unit,
      comparison_population: input.population,
      valid_lift_count: lifts.length,
      entered_lifts: lifts.map((l) => LIFT_BY_ID[l.id]?.name ?? l.id),
      top_lift: bestLift ? (LIFT_BY_ID[bestLift.id]?.name ?? bestLift.id) : null,
      weakest_lift: weakest ? (LIFT_BY_ID[weakest.id]?.name ?? weakest.id) : null,
      has_squat: entered.has('back_squat'),
      has_bench: entered.has('bench_press'),
      has_deadlift: entered.has('deadlift'),
    };
  } catch {
    return {};
  }
}

/** The 4 core fields for share/save events. */
export function shareEventProps(result: IronRankResult): Props {
  try {
    const { composite, archetype } = result;
    return {
      archetype: archetype ? ARCHETYPES[archetype.id].name : 'none',
      strength_score: composite.strengthScore,
      percentile: Math.round(composite.overallPct),
      tier: composite.overallTier,
    };
  } catch {
    return {};
  }
}
