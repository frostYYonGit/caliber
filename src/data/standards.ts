/**
 * CALIBER standards data (§4) — catalog of ~60 lifts.
 *
 * SCORING IS HONEST OR NOTHING. Only the lifts in SCORED_IDS (below) feed the
 * percentile / Strength Score / tier / archetype. Each of those has REAL
 * StrengthLevel per-bodyweight standards transcribed for BOTH sexes (female is
 * NOT derived from male — that male×factor shortcut was the inflation bug). Every
 * other catalog lift is shown and logged but "tracked, not ranked." No invented
 * numbers: a lift without a verified standard is never scored.
 *
 * Tags per lift:
 *   region (group): UPPER / LOWER          — drives the Lifter Type axes
 *   kind:           compound / isolation    — only compounds drive the type
 *   confidence:     HIGH (barbell) / MED (machine/dumbbell/cable, equipment varies)
 *   aliases:        extra search terms (fuzzy add)
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
  ratios: TierRatios; // MALE entry ratios [Novice, Intermediate, Advanced, Elite, World Class]
  ratiosF: TierRatios; // FEMALE entry ratios — sourced separately (never male × factor)
  weight: number; // composite weighting (§4.5 / A4)
  addedLoad: boolean; // ratio = addedWeight / bodyweight
  perHand: boolean; // input is per dumbbell
  hint?: string;
  aliases: string[];
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

type Def = Omit<LiftMeta, 'weight' | 'scored' | 'aliases' | 'ratiosF'>;

const DEFS: Def[] = [
  /* ----------------------------- LEGS (lower) ----------------------------- */
  { id: 'back_squat', name: 'Back Squat', short: 'Squat', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: r(SQUAT), addedLoad: false, perHand: false },
  { id: 'front_squat', name: 'Front Squat', short: 'F. Squat', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: s(SQUAT, 0.85), addedLoad: false, perHand: false },
  { id: 'leg_press', name: 'Leg Press', short: 'Leg Press', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [1.0, 1.75, 2.75, 4.0, 5.25], addedLoad: false, perHand: false, hint: 'sled / machine' },
  { id: 'hack_squat', name: 'Hack Squat', short: 'Hack Sq', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [0.75, 1.25, 2.0, 2.75, 4.0], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'smith_machine_squat', name: 'Smith Machine Squat', short: 'Smith Sq', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [0.75, 1.0, 1.5, 2.25, 3.0], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', short: 'BSS', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [0.25, 0.5, 0.75, 1.25, 1.75], addedLoad: false, perHand: false, hint: 'barbell' },
  { id: 'goblet_squat', name: 'Goblet Squat', short: 'Goblet', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [0.2, 0.35, 0.55, 0.85, 1.15], addedLoad: false, perHand: false },
  { id: 'deadlift', name: 'Deadlift', short: 'Deadlift', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: r(DEAD), addedLoad: false, perHand: false },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', short: 'RDL', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: s(DEAD, 0.85), addedLoad: false, perHand: false },
  { id: 'sumo_deadlift', name: 'Sumo Deadlift', short: 'Sumo DL', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: [1.25, 1.5, 2.25, 2.75, 3.5], addedLoad: false, perHand: false },
  { id: 'trap_bar_deadlift', name: 'Trap Bar Deadlift', short: 'Trap DL', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: [1.0, 1.5, 2.0, 2.75, 3.25], addedLoad: false, perHand: false },
  { id: 'hip_thrust', name: 'Hip Thrust', short: 'Hip Thrust', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [0.5, 1.0, 1.75, 2.5, 3.5], addedLoad: false, perHand: false },
  { id: 'leg_extension', name: 'Leg Extension', short: 'Leg Ext', bodyPart: 'Legs', group: 'lower', kind: 'isolation', confidence: 'MED', ratios: [0.5, 0.75, 1.25, 1.75, 2.5], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'leg_curl', name: 'Lying Leg Curl', short: 'Leg Curl', bodyPart: 'Legs', group: 'lower', kind: 'isolation', confidence: 'MED', ratios: [0.25, 0.5, 0.75, 1.25, 1.75], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'seated_leg_curl', name: 'Seated Leg Curl', short: 'S. Leg Curl', bodyPart: 'Legs', group: 'lower', kind: 'isolation', confidence: 'MED', ratios: [0.5, 0.75, 1.0, 1.5, 2.0], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'deficit_deadlift', name: 'Deficit Deadlift', short: 'Deficit DL', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: [1.0, 1.5, 2.0, 2.5, 3.25], addedLoad: false, perHand: false },
  { id: 'box_squat', name: 'Box Squat', short: 'Box Sq', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: [0.75, 1.25, 1.75, 2.5, 3.25], addedLoad: false, perHand: false },
  { id: 'dumbbell_lunge', name: 'Dumbbell Lunge', short: 'Lunge', bodyPart: 'Legs', group: 'lower', kind: 'compound', confidence: 'MED', ratios: [0.1, 0.2, 0.4, 0.6, 0.85], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'seated_calf_raise', name: 'Seated Calf Raise', short: 'Calf Raise', bodyPart: 'Legs', group: 'lower', kind: 'isolation', confidence: 'MED', ratios: [0.25, 0.75, 1.25, 2.0, 3.0], addedLoad: false, perHand: false, hint: 'machine' },

  /* ----------------------------- CHEST (upper) ---------------------------- */
  { id: 'bench_press', name: 'Bench Press', short: 'Bench', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: r(BENCH), addedLoad: false, perHand: false },
  { id: 'incline_bench', name: 'Incline Bench Press', short: 'Incline', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: s(BENCH, 0.8), addedLoad: false, perHand: false },
  { id: 'dumbbell_bench_press', name: 'Dumbbell Bench Press', short: 'DB Bench', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.2, 0.35, 0.5, 0.75, 1.0], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'incline_dumbbell_press', name: 'Incline Dumbbell Press', short: 'Inc. DB', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.25, 0.35, 0.5, 0.65, 0.85], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'machine_chest_press', name: 'Machine Chest Press', short: 'Mach. Press', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.5, 0.75, 1.25, 1.75, 2.25], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'cable_fly', name: 'Cable Fly', short: 'Fly', bodyPart: 'Chest', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.05, 0.25, 0.5, 0.85, 1.35], addedLoad: false, perHand: false, hint: 'cable / machine' },
  { id: 'weighted_dip', name: 'Weighted Dip', short: 'Dip', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: [0.0, 0.35, 0.6, 0.9, 1.2], addedLoad: true, perHand: false, hint: 'added over bodyweight' },
  { id: 'decline_bench_press', name: 'Decline Bench Press', short: 'Decline', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: [0.5, 1.0, 1.25, 1.75, 2.25], addedLoad: false, perHand: false },
  { id: 'smith_machine_bench_press', name: 'Smith Machine Bench Press', short: 'Smith Bench', bodyPart: 'Chest', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.5, 1.0, 1.25, 1.75, 2.25], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'dumbbell_fly', name: 'Dumbbell Fly', short: 'DB Fly', bodyPart: 'Chest', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.1, 0.15, 0.3, 0.5, 0.7], addedLoad: false, perHand: true, hint: 'per dumbbell' },

  /* --------------------------- SHOULDERS (upper) -------------------------- */
  { id: 'overhead_press', name: 'Overhead Press', short: 'OHP', bodyPart: 'Shoulders', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: r(OHP), addedLoad: false, perHand: false },
  { id: 'dumbbell_shoulder_press', name: 'Dumbbell Shoulder Press', short: 'DB Press', bodyPart: 'Shoulders', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.15, 0.25, 0.4, 0.6, 0.75], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', short: 'Mach. OHP', bodyPart: 'Shoulders', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.25, 0.5, 1.0, 1.5, 2.0], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'arnold_press', name: 'Arnold Press', short: 'Arnold', bodyPart: 'Shoulders', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.1, 0.2, 0.3, 0.45, 0.65], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'lateral_raise', name: 'Lateral Raise', short: 'Lat Raise', bodyPart: 'Shoulders', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.05, 0.1, 0.2, 0.3, 0.45], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'upright_row', name: 'Upright Row', short: 'Upright', bodyPart: 'Shoulders', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.25, 0.5, 0.75, 1.25, 1.5], addedLoad: false, perHand: false },
  { id: 'front_raise', name: 'Front Raise', short: 'Front Raise', bodyPart: 'Shoulders', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.05, 0.1, 0.25, 0.4, 0.55], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'rear_delt_fly', name: 'Rear Delt Fly', short: 'Rear Delt', bodyPart: 'Shoulders', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.05, 0.1, 0.25, 0.4, 0.6], addedLoad: false, perHand: true, hint: 'per dumbbell' },

  /* ----------------------------- BACK (upper) ----------------------------- */
  { id: 'barbell_row', name: 'Barbell Row', short: 'Row', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: s(BENCH, 0.85), addedLoad: false, perHand: false },
  { id: 'dumbbell_row', name: 'Dumbbell Row', short: 'DB Row', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.2, 0.35, 0.55, 0.8, 1.05], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 't_bar_row', name: 'T-Bar Row', short: 'T-Bar', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.5, 0.75, 1.0, 1.5, 2.0], addedLoad: false, perHand: false },
  { id: 'lat_pulldown', name: 'Lat Pulldown', short: 'Pulldown', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.5, 0.75, 1.0, 1.5, 1.75], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'seated_cable_row', name: 'Seated Cable Row', short: 'Cable Row', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.5, 0.75, 1.0, 1.5, 2.0], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'weighted_pullup', name: 'Weighted Pull-up', short: 'Pull-up', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: [0.0, 0.25, 0.5, 0.75, 1.0], addedLoad: true, perHand: false, hint: 'added over bodyweight' },
  { id: 'face_pull', name: 'Face Pull', short: 'Face Pull', bodyPart: 'Back', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.15, 0.35, 0.6, 0.9, 1.3], addedLoad: false, perHand: false, hint: 'cable' },
  { id: 'pendlay_row', name: 'Pendlay Row', short: 'Pendlay', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: [0.5, 0.75, 1.0, 1.5, 1.75], addedLoad: false, perHand: false },
  { id: 'chest_supported_row', name: 'Chest-Supported Row', short: 'CSR', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.1, 0.25, 0.5, 0.75, 1.1], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'machine_row', name: 'Machine Row', short: 'Mach. Row', bodyPart: 'Back', group: 'upper', kind: 'compound', confidence: 'MED', ratios: [0.5, 0.75, 1.25, 1.75, 2.5], addedLoad: false, perHand: false, hint: 'machine' },
  { id: 'straight_arm_pulldown', name: 'Straight-Arm Pulldown', short: 'SA Pulldown', bodyPart: 'Back', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.25, 0.5, 0.75, 1.0, 1.5], addedLoad: false, perHand: false, hint: 'cable' },
  { id: 'barbell_shrug', name: 'Barbell Shrug', short: 'Shrug', bodyPart: 'Back', group: 'upper', kind: 'isolation', confidence: 'HIGH', ratios: [0.5, 1.0, 1.5, 2.25, 3.25], addedLoad: false, perHand: false },
  { id: 'rack_pull', name: 'Rack Pull', short: 'Rack Pull', bodyPart: 'Back', group: 'lower', kind: 'compound', confidence: 'HIGH', ratios: [1.0, 1.75, 2.25, 3.0, 4.0], addedLoad: false, perHand: false },

  /* ----------------------------- ARMS (upper) ----------------------------- */
  { id: 'barbell_curl', name: 'Barbell Curl', short: 'BB Curl', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.2, 0.4, 0.6, 0.85, 1.15], addedLoad: false, perHand: false },
  { id: 'dumbbell_curl', name: 'Dumbbell Curl', short: 'DB Curl', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.1, 0.15, 0.3, 0.5, 0.65], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'hammer_curl', name: 'Hammer Curl', short: 'Hammer', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.1, 0.2, 0.3, 0.45, 0.6], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'cable_curl', name: 'Cable Curl', short: 'Cable Curl', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.15, 0.35, 0.65, 1.05, 1.5], addedLoad: false, perHand: false, hint: 'cable' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', short: 'Pushdown', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.25, 0.5, 0.75, 1.0, 1.5], addedLoad: false, perHand: false, hint: 'cable' },
  { id: 'skullcrusher', name: 'Skullcrusher', short: 'Skulls', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.2, 0.35, 0.55, 0.8, 1.1], addedLoad: false, perHand: false },
  { id: 'overhead_tricep_extension', name: 'Overhead Tricep Extension', short: 'OH Tricep', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.15, 0.35, 0.65, 1.0, 1.4], addedLoad: false, perHand: false, hint: 'cable / dumbbell' },
  { id: 'close_grip_bench_press', name: 'Close-Grip Bench Press', short: 'CGBP', bodyPart: 'Arms', group: 'upper', kind: 'compound', confidence: 'HIGH', ratios: [0.5, 0.75, 1.25, 1.5, 2.0], addedLoad: false, perHand: false },
  { id: 'preacher_curl', name: 'Preacher Curl', short: 'Preacher', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.2, 0.35, 0.6, 0.85, 1.1], addedLoad: false, perHand: false },
  { id: 'ez_bar_curl', name: 'EZ-Bar Curl', short: 'EZ Curl', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.25, 0.4, 0.6, 0.85, 1.1], addedLoad: false, perHand: false },
  { id: 'incline_dumbbell_curl', name: 'Incline Dumbbell Curl', short: 'Inc. Curl', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.1, 0.15, 0.25, 0.4, 0.55], addedLoad: false, perHand: true, hint: 'per dumbbell' },
  { id: 'concentration_curl', name: 'Concentration Curl', short: 'Conc. Curl', bodyPart: 'Arms', group: 'upper', kind: 'isolation', confidence: 'MED', ratios: [0.1, 0.15, 0.3, 0.45, 0.6], addedLoad: false, perHand: true, hint: 'per dumbbell' },
];

/** Extra fuzzy-search terms so common phrasings find the lift. */
const ALIASES: Record<LiftId, string[]> = {
  back_squat: ['squat', 'bb squat', 'barbell squat'],
  front_squat: ['front sq'],
  leg_press: ['legpress'],
  hack_squat: ['hack'],
  smith_machine_squat: ['smith squat', 'smith machine'],
  bulgarian_split_squat: ['bulgarian', 'split squat', 'bss', 'rear foot elevated', 'rfe'],
  goblet_squat: ['goblet'],
  deadlift: ['dl', 'conventional deadlift', 'deads'],
  romanian_deadlift: ['rdl', 'romanian', 'stiff leg', 'stiff-leg', 'sldl'],
  sumo_deadlift: ['sumo'],
  trap_bar_deadlift: ['trap bar', 'hex bar', 'trap deadlift'],
  hip_thrust: ['hipthrust', 'glute bridge', 'glutes'],
  leg_extension: ['leg ext', 'quad extension', 'quads'],
  leg_curl: ['lying leg curl', 'hamstring curl', 'hamstrings'],
  seated_leg_curl: ['seated hamstring'],
  bench_press: ['bench', 'bp', 'flat bench', 'barbell bench'],
  incline_bench: ['incline', 'incline barbell'],
  dumbbell_bench_press: ['db bench', 'dumbbell press', 'db chest'],
  incline_dumbbell_press: ['incline db', 'incline dumbbell'],
  machine_chest_press: ['chest press', 'machine press'],
  cable_fly: ['fly', 'flye', 'chest fly', 'pec fly', 'pec deck', 'pec dec'],
  weighted_dip: ['dip', 'dips'],
  overhead_press: ['ohp', 'military press', 'press', 'standing press', 'shoulder press'],
  dumbbell_shoulder_press: ['db shoulder', 'db ohp', 'seated db press', 'shoulder press'],
  machine_shoulder_press: ['shoulder press machine'],
  arnold_press: ['arnold'],
  lateral_raise: ['lateral', 'lat raise', 'side raise', 'side delt', 'laterals'],
  barbell_row: ['row', 'bent over row', 'bent-over row', 'bor'],
  dumbbell_row: ['db row', 'one arm row'],
  t_bar_row: ['tbar', 't bar'],
  lat_pulldown: ['pulldown', 'lats', 'lat pull'],
  seated_cable_row: ['cable row', 'seated row'],
  weighted_pullup: ['pullup', 'pull up', 'pull-up', 'chin up', 'chinup'],
  face_pull: ['facepull', 'rear delt'],
  barbell_curl: ['curl', 'bb curl', 'bicep curl', 'biceps'],
  dumbbell_curl: ['db curl', 'dumbbell bicep'],
  hammer_curl: ['hammer', 'hammers'],
  cable_curl: ['cable bicep'],
  tricep_pushdown: ['pushdown', 'tricep', 'triceps', 'rope pushdown', 'cable pushdown'],
  skullcrusher: ['skull crusher', 'skulls', 'lying tricep', 'lying triceps extension', 'ez tricep'],
  overhead_tricep_extension: ['overhead tricep', 'tricep extension', 'overhead extension'],
  deficit_deadlift: ['deficit', 'deficit dl'],
  box_squat: ['box', 'box sq'],
  dumbbell_lunge: ['lunge', 'lunges', 'walking lunge', 'db lunge', 'reverse lunge'],
  seated_calf_raise: ['calf raise', 'calf', 'calves', 'seated calf', 'calf raises'],
  decline_bench_press: ['decline', 'decline bench'],
  smith_machine_bench_press: ['smith bench', 'smith machine bench'],
  dumbbell_fly: ['db fly', 'dumbbell flye', 'chest fly', 'flyes', 'flys'],
  upright_row: ['upright', 'upright rows'],
  front_raise: ['front delt', 'front raises', 'db front raise'],
  rear_delt_fly: ['rear delt', 'reverse fly', 'rear fly', 'reverse flye', 'rear delt raise'],
  pendlay_row: ['pendlay', 'pendlay rows'],
  chest_supported_row: ['chest supported', 'chest-supported', 'seal row', 'csr'],
  machine_row: ['seated machine row', 'hammer row'],
  straight_arm_pulldown: ['straight arm', 'straight-arm', 'lat pushdown', 'straight arm pushdown'],
  barbell_shrug: ['shrug', 'shrugs', 'traps', 'dumbbell shrug', 'db shrug'],
  rack_pull: ['rack', 'rackpull', 'partial deadlift'],
  close_grip_bench_press: ['close grip', 'close-grip', 'cgbp', 'close grip bench'],
  preacher_curl: ['preacher'],
  ez_bar_curl: ['ez bar', 'ez curl', 'ezbar'],
  incline_dumbbell_curl: ['incline curl', 'incline db curl'],
  concentration_curl: ['concentration', 'conc curl'],
};

/* --------------------- Scored lifts & StrengthLevel standards ----------------- *
 * Only these lifts are SCORED. Each has REAL StrengthLevel per-bodyweight
 * standards transcribed below for BOTH sexes — female is NOT derived from male
 * (the male×factor derivation was the calibration bug). Every other catalog lift
 * is "tracked, not ranked": shown and logged, but excluded from the percentile,
 * Strength Score, tier, and archetype. No invented numbers — a lift without a
 * verified standard is not scored.
 *
 * Values are StrengthLevel entry thresholds [Novice, Intermediate, Advanced,
 * Elite] as bodyweight ratios at a reference bodyweight (FEMALE 150 lb, MALE
 * 200 lb), plus a World Class slot = Elite × 1.15 (Caliber's ceiling tier above
 * SL's top level). Paired with PCT_EDGES, a lifter lands in the highest SL level
 * they meet — mirroring StrengthLevel's own labels.
 * ----------------------------------------------------------------------------- */
const SCORED_IDS = new Set<LiftId>([
  'back_squat', 'front_squat', 'deadlift', 'romanian_deadlift', 'leg_press',
  'bench_press', 'incline_bench', 'dumbbell_bench_press',
  'overhead_press', 'dumbbell_shoulder_press',
  'barbell_row', 'dumbbell_row', 'lat_pulldown', 'seated_cable_row',
]);

const MALE_STD: Record<LiftId, TierRatios> = {
  back_squat: [1.24, 1.615, 2.04, 2.495, 2.869],
  front_squat: [0.99, 1.28, 1.61, 1.96, 2.254],
  deadlift: [1.45, 1.865, 2.335, 2.835, 3.26],
  romanian_deadlift: [1.115, 1.51, 1.965, 2.45, 2.818],
  leg_press: [1.955, 2.8, 3.805, 4.9, 5.635],
  bench_press: [0.935, 1.23, 1.56, 1.91, 2.197],
  incline_bench: [0.86, 1.11, 1.39, 1.685, 1.938],
  dumbbell_bench_press: [0.355, 0.515, 0.705, 0.91, 1.047],
  overhead_press: [0.595, 0.8, 1.035, 1.285, 1.478],
  dumbbell_shoulder_press: [0.295, 0.415, 0.555, 0.705, 0.811],
  barbell_row: [0.8, 1.065, 1.37, 1.69, 1.944],
  dumbbell_row: [0.38, 0.55, 0.75, 0.975, 1.121],
  lat_pulldown: [0.74, 1.005, 1.315, 1.645, 1.892],
  seated_cable_row: [0.8, 1.07, 1.385, 1.715, 1.972],
};

const FEMALE_STD: Record<LiftId, TierRatios> = {
  back_squat: [0.767, 1.12, 1.54, 2.007, 2.308],
  front_squat: [0.687, 0.94, 1.233, 1.547, 1.779],
  deadlift: [0.92, 1.313, 1.78, 2.287, 2.63],
  romanian_deadlift: [0.693, 1.007, 1.367, 1.767, 2.032],
  leg_press: [1.26, 2.087, 3.12, 4.3, 4.945],
  bench_press: [0.493, 0.76, 1.087, 1.453, 1.671],
  incline_bench: [0.407, 0.66, 0.967, 1.32, 1.518],
  dumbbell_bench_press: [0.187, 0.32, 0.48, 0.673, 0.774],
  overhead_press: [0.34, 0.513, 0.72, 0.947, 1.089],
  dumbbell_shoulder_press: [0.153, 0.24, 0.34, 0.453, 0.521],
  barbell_row: [0.407, 0.62, 0.88, 1.167, 1.342],
  dumbbell_row: [0.213, 0.327, 0.46, 0.62, 0.713],
  lat_pulldown: [0.467, 0.687, 0.94, 1.227, 1.411],
  seated_cable_row: [0.493, 0.713, 0.973, 1.267, 1.457],
};

/** Composite weight (A4): HIGH compound full, MED compound ×0.75, isolation low. */
const weightFor = (d: Def): number =>
  d.kind === 'isolation' ? 0.25 : d.confidence === 'HIGH' ? 1.0 : 0.75;

export const LIFTS: LiftMeta[] = DEFS.map((d) => {
  // Scored lifts use the StrengthLevel per-sex standards; tracked-only lifts
  // keep their (unused) catalog ratios as a harmless fallback.
  const ratios = MALE_STD[d.id] ?? d.ratios;
  const ratiosF = FEMALE_STD[d.id] ?? ratios;
  return {
    ...d,
    ratios,
    ratiosF,
    weight: weightFor(d),
    scored: SCORED_IDS.has(d.id),
    aliases: ALIASES[d.id] ?? [],
  };
});

export const LIFT_BY_ID: Record<LiftId, LiftMeta> = Object.fromEntries(
  LIFTS.map((l) => [l.id, l]),
);

/** Preloaded defaults — recognizable everyday lifts, BENCH FIRST. Three so the
 *  all-expanded stack stays short; covers an upper + lower for the type read. */
export const DEFAULT_LIFTS: LiftId[] = ['bench_press', 'lat_pulldown', 'leg_press'];

export const LIFTS_BY_BODY_PART: Record<BodyPart, LiftMeta[]> = Object.fromEntries(
  BODY_PART_ORDER.map((bp) => [bp, LIFTS.filter((l) => l.bodyPart === bp)]),
) as Record<BodyPart, LiftMeta[]>;

export const isScored = (id: LiftId): boolean => LIFT_BY_ID[id]?.scored ?? false;
export const isCompound = (id: LiftId): boolean => LIFT_BY_ID[id]?.kind === 'compound';

/** Custom (logged, unscored) lifts a user adds when a search truly misses. */
export const CUSTOM_PREFIX = 'custom:';
export const isCustom = (id: LiftId): boolean => id.startsWith(CUSTOM_PREFIX);
export const customName = (id: LiftId): string => id.slice(CUSTOM_PREFIX.length);

/* -------------------- Per-sex standards (§4.2b) — both from SL ----------------- */
/* Female standards are real StrengthLevel female tables, NOT male × a factor. */

export const STANDARDS_MALE: Record<LiftId, TierRatios> = Object.fromEntries(
  LIFTS.map((l) => [l.id, l.ratios]),
);

export const STANDARDS_FEMALE: Record<LiftId, TierRatios> = Object.fromEntries(
  LIFTS.map((l) => [l.id, l.ratiosF]),
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

/**
 * Fraction of peak strength at a given age. The post-peak decline was softened
 * (it was over-boosting 40+ lifters: old 45→0.964, 70→0.76 gave a +32% boost).
 * The young ramp is unchanged. Now the boost is gentle — a 45yo ≈ 0.98 (+2%),
 * a 70yo ≈ 0.89 (+12%) — so age no longer inflates older lifters into top tiers.
 */
export const AGE_COEFF: Record<number, number> = {
  13: 0.8, 14: 0.83, 15: 0.86, 16: 0.89, 17: 0.92, 18: 0.94, 19: 0.96,
  20: 0.98, 24: 1.0, 34: 1.0, 40: 0.99, 50: 0.975, 60: 0.94, 70: 0.89, 80: 0.83,
};

/* --------------------------- Population multipliers (§4.4) --------------------- */
/* Anchored so the DEFAULT "people who lift" == StrengthLevel (its logged-lifter
 * population). "Serious" raises the bar; "general population" lowers it. */

export const POP_MULT: Record<Population, number> = { serious: 1.15, gym: 1.0, general: 0.72 };

/* ----------------------- Percentile / tier mapping (§4.5) ---------------------- */
/* Band entry percentiles aligned to StrengthLevel's level definitions so the
 * tier a lifter sees == StrengthLevel's: Novice ≥20th, Intermediate ≥50th,
 * Advanced ≥80th, Elite ≥95th. World Class (≥99th) is Caliber's ceiling above
 * SL's top. (Was [0,10,35,70,90,98,…], which inflated mid lifts to Elite.) */
export const PCT_EDGES = [0, 20, 50, 80, 95, 99, 99.9] as const;
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
