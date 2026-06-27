/**
 * CALIBER standards data (§4) — expanded library (Edit A).
 *
 * Every lift has a real published bodyweight-ratio standard. Barbell anchors are
 * the original spec values (and the blessed 0.85×/0.80× derivations); machine &
 * dumbbell lifts are sourced from Strength Level (150M+ logged lifts) — their
 * Beginner→Elite ratios map onto our Novice→World Class thresholds. No invented
 * numbers: a lift without a real standard is not in the library.
 *
 * Tags per lift:
 *   region (group): UPPER / LOWER          — drives the Lifter Type axes
 *   kind:           compound / isolation    — only compounds drive the type
 *   confidence:     HIGH (barbell) / MED (machine/dumbbell, equipment varies)
 * MED compounds are down-weighted in the composite; isolation lifts show a
 * percentile but never drive the archetype.
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

export type TierRatios = [number, number, number, number, number];

export type Group = 'upper' | 'lower';
export type BodyPart = 'Legs' | 'Chest' | 'Shoulders' | 'Back' | 'Arms';
export type Kind = 'compound' | 'isolation';
export type Confidence = 'HIGH' | 'MED';

export const BODY_PART_ORDER: BodyPart[] = ['Legs', 'Chest', 'Shoulders', 'Back', 'Arms'];

export interface LiftMeta {
  id: LiftId;
  name: string;
  short: string;
  bodyPart: BodyPart;
  group: Group;
  kind: Kind;
  confidence: Confidence;
  ratios: TierRatios; // MALE [Novice, Intermediate, Advanced, Elite, World Class]
  weight: number; // composite weighting (§4.5 / A4)
  addedLoad: boolean; // ratio = addedWeight / bodyweight
  perHand: boolean; // input is per dumbbell
  hint?: string;
  defaultActive: boolean;
  scored: boolean;
}

/* ------------------------------- Anchors / helpers ---------------------------- */

const SQUAT = [0.9, 1.4, 1.9, 2.4, 2.8];
const BENCH = [0.5, 0.9, 1.25, 1.75, 2.1];
const DEAD = [1.1, 1.6, 2.25, 2.75, 3.2];
const OHP = [0.4, 0.6, 0.9, 1.2, 1.45];

const s = (arr: readonly number[], k: number): TierRatios =>
  arr.map((v) => +(v * k).toFixed(4)) as unknown as TierRatios;
const r = (arr: readonly number[]): TierRatios => [...arr] as TierRatios;

type Def = Omit<LiftMeta, 'weight' | 'scored'>;

const DEFS: Def[] = [
  /* ----------------------------- LEGS (lower) ----------------------------- */
  { id: 'back_squat', name: 'Back Squat', short: 'Squat', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: r(SQUAT), addedLoad: false, perHand: false, defaultActive: true },
  { id: 'front_squat', name: 'Front Squat', short: 'F. Squat', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: s(SQUAT, 0.85), addedLoad: false, perHand: false, defaultActive: false },
  { id: 'leg_press', name: 'Leg Press', short: 'Leg Press', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [1.0, 1.75, 2.75, 4.0, 5.25], addedLoad: false, perHand: false, hint: 'sled / machine', defaultActive: false },
  { id: 'hack_squat', name: 'Hack Squat', short: 'Hack Sq', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [0.75, 1.25, 2.0, 2.75, 4.0], addedLoad: false, perHand: false, hint: 'machine', defaultActive: false },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', short: 'BSS', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [0.25, 0.5, 0.75, 1.25, 1.75], addedLoad: false, perHand: false, hint: 'barbell', defaultActive: false },
  { id: 'deadlift', name: 'Deadlift', short: 'Deadlift', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: r(DEAD), addedLoad: false, perHand: false, defaultActive: true },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', short: 'RDL', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: s(DEAD, 0.85), addedLoad: false, perHand: false, defaultActive: false },
  { id: 'hip_thrust', name: 'Hip Thrust', short: 'Hip Thrust', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [0.5, 1.0, 1.75, 2.5, 3.5], addedLoad: false, perHand: false, defaultActive: false },
  { id: 'leg_extension', name: 'Leg Extension', short: 'Leg Ext', bodyPart: 'Legs', group: 'lower', kind: 'isolation', confidence: 'MED', ratios: [0.5, 0.75, 1.25, 1.75, 2.5], addedLoad: false, perHand: false, hint: 'machine', defaultActive: false },
  { id: 'leg_curl', name: 'Leg Curl', short: 'Leg Curl', bodyPart: 'Legs', group: 'lower', kind: 'isolation', confidence: 'MED', ratios: [0.25, 0.5, 0.75, 1.25, 1.75], addedLoad: false, perHand: false, hint: 'machine', defaultActive: false },

  /* ----------------------------- CHEST (upper) ---------------------------- */
  { id: 'bench_press', name: 'Bench Press', short: 'Bench', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: r(BENCH), addedLoad: false, perHand: false, defaultActive: true },
  { id: 'incline_bench', name: 'Incline Bench Press', short: 'Incline', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: s(BENCH, 0.8), addedLoad: false, perHand: false, defaultActive: false },
  { id: 'dumbbell_bench_press', name: 'Dumbbell Bench Press', short: 'DB Bench', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.2, 0.35, 0.5, 0.75, 1.0], addedLoad: false, perHand: true, hint: 'per dumbbell', defaultActive: false },
  { id: 'machine_chest_press', name: 'Machine Chest Press', short: 'Mach. Press', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.5, 0.75, 1.25, 1.75, 2.25], addedLoad: false, perHand: false, hint: 'machine', defaultActive: false },
  { id: 'weighted_dip', name: 'Weighted Dip', short: 'Dip', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: [0.0, 0.35, 0.6, 0.9, 1.2], addedLoad: true, perHand: false, hint: 'added over bodyweight', defaultActive: false },

  /* --------------------------- SHOULDERS (upper) -------------------------- */
  { id: 'overhead_press', name: 'Overhead Press', short: 'OHP', bodyPart: 'Shoulders', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: r(OHP), addedLoad: false, perHand: false, defaultActive: true },
  { id: 'dumbbell_shoulder_press', name: 'Dumbbell Shoulder Press', short: 'DB Press', bodyPart: 'Shoulders', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.15, 0.25, 0.4, 0.6, 0.75], addedLoad: false, perHand: true, hint: 'per dumbbell', defaultActive: false },
  { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', short: 'Mach. OHP', bodyPart: 'Shoulders', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.25, 0.5, 1.0, 1.5, 2.0], addedLoad: false, perHand: false, hint: 'machine', defaultActive: false },

  /* ----------------------------- BACK (upper) ----------------------------- */
  { id: 'barbell_row', name: 'Barbell Row', short: 'Row', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: s(BENCH, 0.85), addedLoad: false, perHand: false, defaultActive: false },
  { id: 'dumbbell_row', name: 'Dumbbell Row', short: 'DB Row', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.2, 0.35, 0.55, 0.8, 1.05], addedLoad: false, perHand: true, hint: 'per dumbbell', defaultActive: false },
  { id: 'lat_pulldown', name: 'Lat Pulldown', short: 'Pulldown', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.5, 0.75, 1.0, 1.5, 1.75], addedLoad: false, perHand: false, hint: 'machine', defaultActive: false },
  { id: 'seated_cable_row', name: 'Seated Cable Row', short: 'Cable Row', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.5, 0.75, 1.0, 1.5, 2.0], addedLoad: false, perHand: false, hint: 'machine', defaultActive: false },
  { id: 'weighted_pullup', name: 'Weighted Pull-up', short: 'Pull-up', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: [0.0, 0.25, 0.5, 0.75, 1.0], addedLoad: true, perHand: false, hint: 'added over bodyweight', defaultActive: false },

  /* ----------------------------- ARMS (upper) ----------------------------- */
  { id: 'barbell_curl', name: 'Barbell Curl', short: 'BB Curl', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.2, 0.4, 0.6, 0.85, 1.15], addedLoad: false, perHand: false, defaultActive: false },
  { id: 'dumbbell_curl', name: 'Dumbbell Curl', short: 'DB Curl', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.1, 0.15, 0.3, 0.5, 0.65], addedLoad: false, perHand: true, hint: 'per dumbbell', defaultActive: false },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', short: 'Pushdown', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.25, 0.5, 0.75, 1.0, 1.5], addedLoad: false, perHand: false, hint: 'cable', defaultActive: false },
];

/** Composite weight (A4): HIGH compound full, MED compound ×0.75, isolation low. */
const weightFor = (d: Def): number =>
  d.kind === 'isolation' ? 0.25 : d.confidence === 'HIGH' ? 1.0 : 0.75;

export const LIFTS: LiftMeta[] = DEFS.map((d) => ({ ...d, weight: weightFor(d), scored: true }));

export const LIFT_BY_ID: Record<LiftId, LiftMeta> = Object.fromEntries(
  LIFTS.map((l) => [l.id, l]),
);

export const DEFAULT_LIFTS: LiftId[] = LIFTS.filter((l) => l.defaultActive).map((l) => l.id);

export const LIFTS_BY_BODY_PART: Record<BodyPart, LiftMeta[]> = Object.fromEntries(
  BODY_PART_ORDER.map((bp) => [bp, LIFTS.filter((l) => l.bodyPart === bp)]),
) as Record<BodyPart, LiftMeta[]>;

export const isScored = (id: LiftId): boolean => LIFT_BY_ID[id]?.scored ?? false;
export const isCompound = (id: LiftId): boolean => LIFT_BY_ID[id]?.kind === 'compound';

/* ----------------------- Female factors by family (§4.2b) ---------------------- */
// Family inferred from movement: legs => squat, presses => press, pulls => pull.

function familyOf(l: Def): 'squat' | 'press' | 'pull' {
  if (l.group === 'lower') return 'squat';
  if (l.bodyPart === 'Back') return 'pull';
  if (l.bodyPart === 'Arms') return l.id === 'barbell_curl' || l.id === 'dumbbell_curl' ? 'pull' : 'press';
  return 'press'; // Chest, Shoulders
}

const FEMALE_FACTOR = { squat: 0.72, press: 0.62, pull: 0.66 } as const;

export const STANDARDS_MALE: Record<LiftId, TierRatios> = Object.fromEntries(
  LIFTS.map((l) => [l.id, l.ratios]),
);

export const STANDARDS_FEMALE: Record<LiftId, TierRatios> = Object.fromEntries(
  DEFS.map((d) => [d.id, s(d.ratios, FEMALE_FACTOR[familyOf(d)])]),
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
  13: 0.8, 14: 0.83, 15: 0.86, 16: 0.89, 17: 0.92, 18: 0.94, 19: 0.96,
  20: 0.98, 24: 1.0, 34: 1.0, 39: 0.99, 44: 0.97, 49: 0.94,
  54: 0.9, 59: 0.86, 64: 0.81, 69: 0.76, 80: 0.7,
};

/* --------------------------- Population multipliers (§4.4) --------------------- */

export const POP_MULT: Record<Population, number> = { serious: 1.0, gym: 0.85, general: 0.62 };

/* ----------------------- Percentile / tier mapping (§4.5) ---------------------- */

export const PCT_EDGES = [0, 10, 35, 70, 90, 98, 99.9] as const;
export const TIERS: Tier[] = [
  'Untrained', 'Novice', 'Intermediate', 'Advanced', 'Elite', 'World Class',
];

/* ------------------------------- DOTS (§4.6) ---------------------------------- */

export const DOTS_MALE = {
  a: -307.75076, b: 24.0900756, c: -0.1918759221, d: 0.0007391293, e: -0.000001093,
} as const;
export const DOTS_FEMALE = {
  a: -57.96288, b: 13.6175032, c: -0.1126655495, d: 0.0005158568, e: -0.0000010706,
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
  Untrained: 0.18, Novice: 0.26, Intermediate: 0.34, Advanced: 0.44, Elite: 0.54, 'World Class': 0.64,
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
