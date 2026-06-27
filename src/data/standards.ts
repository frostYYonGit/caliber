/**
 * CALIBER standards data (§4). Curated to 11 lifts that all have real,
 * defensible bodyweight standards — no made-up numbers.
 *
 * Each lift carries MALE start-of-tier ratios:
 *   [Novice, Intermediate, Advanced, Elite, World Class]
 * Below the Novice entry = Untrained. Female thresholds = male × a per-family
 * factor (§4.2b). Derived lifts scale an anchor element-wise.
 *
 * `group` (upper / lower) powers the Add-lift grouping and the Lifter Type axes.
 */

export type LiftId = string;

export type Sex = 'male' | 'female';
export type Population = 'general' | 'gym' | 'serious';
export type Tier =
  | 'Untrained'
  | 'Novice'
  | 'Intermediate'
  | 'Advanced'
  | 'Elite'
  | 'World Class';

/** A 5-tuple of start-of-tier ratios. */
export type TierRatios = [number, number, number, number, number];

export type Family = 'squat' | 'press' | 'pull';
export type Group = 'upper' | 'lower';

export interface LiftMeta {
  id: LiftId;
  name: string;
  short: string;
  group: Group;
  family: Family;
  ratios: TierRatios; // MALE
  weight: number; // composite weighting (§4.5)
  addedLoad: boolean; // true => ratio = addedWeight / bodyweight
  perHand: boolean; // input is per-dumbbell
  hint?: string;
  defaultActive: boolean;
  /** Always true in v1 — every lift here has real standards and is scored. */
  scored: boolean;
}

/* ------------------------------- Anchor ratios -------------------------------- */

const A = {
  back_squat: [0.9, 1.4, 1.9, 2.4, 2.8],
  bench_press: [0.5, 0.9, 1.25, 1.75, 2.1],
  deadlift: [1.1, 1.6, 2.25, 2.75, 3.2],
  overhead_press: [0.4, 0.6, 0.9, 1.2, 1.45],
  weighted_pullup: [0.0, 0.25, 0.5, 0.75, 1.0],
  weighted_dip: [0.0, 0.35, 0.6, 0.9, 1.2],
} as const;

const s = (arr: readonly number[], k: number): TierRatios =>
  arr.map((v) => +(v * k).toFixed(4)) as unknown as TierRatios;

const r = (arr: readonly number[]): TierRatios => [...arr] as TierRatios;

/* --------------------------------- Lift library ------------------------------- */
// Core (preloaded, removable) + a tight addable set, all with real standards.

type Def = Omit<LiftMeta, 'scored'>;

const DEFS: Def[] = [
  // Core
  { id: 'back_squat', name: 'Back Squat', short: 'Squat', group: 'lower', family: 'squat', ratios: r(A.back_squat), weight: 1, addedLoad: false, perHand: false, defaultActive: true },
  { id: 'bench_press', name: 'Bench Press', short: 'Bench', group: 'upper', family: 'press', ratios: r(A.bench_press), weight: 1, addedLoad: false, perHand: false, defaultActive: true },
  { id: 'deadlift', name: 'Deadlift', short: 'Deadlift', group: 'lower', family: 'pull', ratios: r(A.deadlift), weight: 1, addedLoad: false, perHand: false, defaultActive: true },
  { id: 'overhead_press', name: 'Overhead Press', short: 'OHP', group: 'upper', family: 'press', ratios: r(A.overhead_press), weight: 0.6, addedLoad: false, perHand: false, defaultActive: true },

  // Addable — Lower
  { id: 'front_squat', name: 'Front Squat', short: 'F. Squat', group: 'lower', family: 'squat', ratios: s(A.back_squat, 0.85), weight: 0.6, addedLoad: false, perHand: false, defaultActive: false },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', short: 'RDL', group: 'lower', family: 'pull', ratios: s(A.deadlift, 0.85), weight: 0.5, addedLoad: false, perHand: false, defaultActive: false },
  { id: 'hip_thrust', name: 'Hip Thrust', short: 'Hip Thrust', group: 'lower', family: 'squat', ratios: s(A.deadlift, 1.4), weight: 0.5, addedLoad: false, perHand: false, defaultActive: false },

  // Addable — Upper
  { id: 'incline_bench', name: 'Incline Bench', short: 'Incline', group: 'upper', family: 'press', ratios: s(A.bench_press, 0.8), weight: 0.6, addedLoad: false, perHand: false, defaultActive: false },
  { id: 'barbell_row', name: 'Barbell Row', short: 'Row', group: 'upper', family: 'pull', ratios: s(A.bench_press, 0.85), weight: 0.6, addedLoad: false, perHand: false, defaultActive: false },
  { id: 'weighted_pullup', name: 'Weighted Pull-up', short: 'Pull-up', group: 'upper', family: 'pull', ratios: r(A.weighted_pullup), weight: 0.5, addedLoad: true, perHand: false, hint: 'added over bodyweight', defaultActive: false },
  { id: 'weighted_dip', name: 'Weighted Dip', short: 'Dip', group: 'upper', family: 'press', ratios: r(A.weighted_dip), weight: 0.5, addedLoad: true, perHand: false, hint: 'added over bodyweight', defaultActive: false },
];

export const LIFTS: LiftMeta[] = DEFS.map((d) => ({ ...d, scored: true }));

export const LIFT_BY_ID: Record<LiftId, LiftMeta> = Object.fromEntries(
  LIFTS.map((l) => [l.id, l]),
);

export const DEFAULT_LIFTS: LiftId[] = LIFTS.filter((l) => l.defaultActive).map((l) => l.id);

export const ADDABLE_BY_GROUP: Record<Group, LiftMeta[]> = {
  upper: LIFTS.filter((l) => l.group === 'upper'),
  lower: LIFTS.filter((l) => l.group === 'lower'),
};

export const isScored = (id: LiftId): boolean => LIFT_BY_ID[id]?.scored ?? false;

/* ----------------------- Female factors by family (§4.2b) ---------------------- */

const FEMALE_FACTOR: Record<Family, number> = {
  squat: 0.72,
  press: 0.62,
  pull: 0.66,
};

export const STANDARDS_MALE: Record<LiftId, TierRatios> = Object.fromEntries(
  LIFTS.map((l) => [l.id, l.ratios]),
);

export const STANDARDS_FEMALE: Record<LiftId, TierRatios> = Object.fromEntries(
  LIFTS.map((l) => [l.id, s(l.ratios, FEMALE_FACTOR[l.family])]),
);

export const STANDARDS: Record<Sex, Record<LiftId, TierRatios>> = {
  male: STANDARDS_MALE,
  female: STANDARDS_FEMALE,
};

export const WEIGHT: Record<LiftId, number> = Object.fromEntries(
  LIFTS.map((l) => [l.id, l.weight]),
);

export const ADDED_LOAD_LIFTS: ReadonlySet<LiftId> = new Set(
  LIFTS.filter((l) => l.addedLoad).map((l) => l.id),
);

/* ------------------------------ Age coefficients (§4.3) ------------------------ */

export const AGE_COEFF: Record<number, number> = {
  13: 0.8,
  14: 0.83,
  15: 0.86,
  16: 0.89,
  17: 0.92,
  18: 0.94,
  19: 0.96,
  20: 0.98,
  24: 1.0,
  34: 1.0,
  39: 0.99,
  44: 0.97,
  49: 0.94,
  54: 0.9,
  59: 0.86,
  64: 0.81,
  69: 0.76,
  80: 0.7,
};

/* --------------------------- Population multipliers (§4.4) --------------------- */

export const POP_MULT: Record<Population, number> = {
  serious: 1.0,
  gym: 0.85,
  general: 0.62,
};

/* ----------------------- Percentile / tier mapping (§4.5) ---------------------- */

export const PCT_EDGES = [0, 10, 35, 70, 90, 98, 99.9] as const;
export const TIERS: Tier[] = [
  'Untrained',
  'Novice',
  'Intermediate',
  'Advanced',
  'Elite',
  'World Class',
];

/* ------------------------------- DOTS (§4.6) ---------------------------------- */

export const DOTS_MALE = {
  a: -307.75076,
  b: 24.0900756,
  c: -0.1918759221,
  d: 0.0007391293,
  e: -0.000001093,
} as const;

export const DOTS_FEMALE = {
  a: -57.96288,
  b: 13.6175032,
  c: -0.1126655495,
  d: 0.0005158568,
  e: -0.0000010706,
} as const;

/* ------------------------------- Tier presentation ---------------------------- */

export const TIER_COLOR: Record<Tier, string> = {
  Untrained: '#AEB4BF',
  Novice: '#5FB0EC',
  Intermediate: '#E6EAF1',
  Advanced: '#F4B23E',
  Elite: '#FF7A2E',
  'World Class': '#FFD45E',
};

export const TIER_GLOW: Record<Tier, number> = {
  Untrained: 0.18,
  Novice: 0.26,
  Intermediate: 0.34,
  Advanced: 0.44,
  Elite: 0.54,
  'World Class': 0.64,
};

export const TIER_VERDICT: Record<Tier, string> = {
  Untrained: 'Everyone starts here. Go pick up the bar.',
  Novice: 'Foundation laid. Now stack the plates.',
  Intermediate: 'Stronger than most people who lift. Keep climbing.',
  Advanced: 'Top 10–30% of lifters. The muscle is earned.',
  Elite: 'Top 2%. Rarefied air up here.',
  'World Class': 'Top 0.1%. Genetically gifted or relentless — either way, a freak.',
};

export const POP_LABEL: Record<Population, string> = {
  general: 'the general population',
  gym: 'people who lift',
  serious: 'serious lifters',
};
