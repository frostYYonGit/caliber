/**
 * Bridges the onboarding state and the scoring engine into one Result object
 * the card renders from. Used by both the live flow and shared result links.
 *
 * Only *scored* lifts drive the rank/percentile/composite. Tracked-only lifts
 * are carried through for display (logged, never faked into a percentile).
 */
import {
  LIFT_BY_ID,
  isScored,
  type LiftId,
  type Population,
  type Sex,
  type Tier,
} from '../data/standards';
import {
  compositeScore,
  dots,
  dotsLabel,
  closestRankUp,
  oneRM,
  scoreLift,
  type Composite,
  type LiftEntry,
  type LiftResult,
  type RankUp,
  type ScoreContext,
} from './scoring';
import { toKg, type Unit } from './units';
import { classify, type Classification } from './classify';
import { isLiftEntered, parseNum, type QuizState } from '../state/quizReducer';

export interface ResolvedInput {
  sex: Sex;
  age: number;
  bodyweightKg: number;
  population: Population;
  unit: Unit;
  entries: LiftEntry[];
}

export interface DotsResult {
  score: number;
  label: string;
}

export interface TrackedLift {
  id: LiftId;
  oneRMkg: number;
  ratio: number;
}

export interface IronRankResult {
  input: ResolvedInput;
  ctx: ScoreContext;
  /** Scored lifts, ranked. */
  lifts: LiftResult[];
  /** Logged but not scored. */
  tracked: TrackedLift[];
  /** The user's most flattering true angle — highest-percentile scored lift. */
  bestLift: LiftResult | null;
  composite: Composite;
  dots: DotsResult | null;
  rankUp: RankUp | null;
  /** Lifter Type — null when only one of upper/lower was entered (teaser). */
  archetype: Classification | null;
  /** True when age is outside the 24–34 peak band (§4.3, printed on card). */
  ageAdjusted: boolean;
}

const PEAK_LO = 24;
const PEAK_HI = 34;

/** Convert the live onboarding state into resolved, kg-based scoring input. */
export function resolveQuiz(state: QuizState): ResolvedInput | null {
  if (!state.sex || !state.population) return null;
  const age = parseNum(state.age);
  const bw = parseNum(state.bodyweight);
  if (!Number.isFinite(age) || !Number.isFinite(bw) || bw <= 0) return null;

  const entries: LiftEntry[] = [];
  for (const id of state.order) {
    const draft = state.lifts[id];
    if (!isLiftEntered(id, draft)) continue;
    entries.push({
      id,
      weightKg: toKg(parseNum(draft!.weight), state.unit),
      reps: draft!.reps,
    });
  }
  if (entries.length === 0) return null;

  return {
    sex: state.sex,
    age,
    bodyweightKg: toKg(bw, state.unit),
    population: state.population,
    unit: state.unit,
    entries,
  };
}

/** Compute the full result from resolved input. */
export function buildResult(input: ResolvedInput): IronRankResult {
  const ctx: ScoreContext = {
    sex: input.sex,
    age: input.age,
    bodyweightKg: input.bodyweightKg,
    population: input.population,
  };

  const scoredEntries = input.entries.filter((e) => isScored(e.id));
  const trackedEntries = input.entries.filter((e) => !isScored(e.id));

  const lifts = scoredEntries.map((e) => scoreLift(e, ctx));
  const tracked: TrackedLift[] = trackedEntries.map((e) => {
    const oneRMkg = oneRM(e.weightKg, e.reps);
    return { id: e.id, oneRMkg, ratio: oneRMkg / input.bodyweightKg };
  });

  const composite = compositeScore(lifts);
  const rankUp = closestRankUp(scoredEntries, ctx);

  const bestLift =
    lifts.length === 0
      ? null
      : lifts.reduce((best, l) => (l.percentile > best.percentile ? l : best));

  // DOTS requires Back Squat + Bench + Deadlift (§4.6).
  const byId = new Map(scoredEntries.map((e) => [e.id, e]));
  let dotsResult: DotsResult | null = null;
  const need: LiftId[] = ['back_squat', 'bench_press', 'deadlift'];
  if (need.every((id) => byId.has(id))) {
    const liftById = new Map(lifts.map((l) => [l.id, l]));
    const totalKg = need.reduce((sum, id) => sum + liftById.get(id)!.oneRMkg, 0);
    const score = dots(input.sex, totalKg, input.bodyweightKg);
    dotsResult = { score, label: dotsLabel(score) };
  }

  return {
    input,
    ctx,
    lifts,
    tracked,
    bestLift,
    composite,
    dots: dotsResult,
    rankUp,
    archetype: classify(lifts, composite.overallPct),
    ageAdjusted: input.age < PEAK_LO || input.age > PEAK_HI,
  };
}

/** "stronger than X%" -> "top Y%" (the flex framing). */
export function topPercent(percentile: number): string {
  const top = Math.max(0.1, 100 - percentile);
  return top >= 10 ? `top ${Math.round(top)}%` : `top ${top.toFixed(1)}%`;
}

export function liftDisplayName(id: LiftId): string {
  return LIFT_BY_ID[id].name;
}

export function tierLabel(tier: Tier): string {
  return tier.toUpperCase();
}
