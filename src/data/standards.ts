/**
 * CALIBER standards data (§4) — full catalog (~60 lifts).
 *
 * Every lift has a real published bodyweight-ratio standard. Barbell anchors are
 * the original spec values (and blessed 0.85×/0.80× derivations); machine,
 * dumbbell, cable & variation lifts are sourced from Strength Level (150M+
 * logged lifts) — their Beginner→Elite ratios map onto our Novice→World Class
 * thresholds. No invented numbers: a lift without a real standard is not here.
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
  ratios: TierRatios; // MALE [Novice, Intermediate, Advanced, Elite, World Class]
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

type Def = Omit<LiftMeta, 'weight' | 'scored' | 'aliases'>;

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

/** Composite weight (A4): HIGH compound full, MED compound ×0.75, isolation low. */
const weightFor = (d: Def): number =>
  d.kind === 'isolation' ? 0.25 : d.confidence === 'HIGH' ? 1.0 : 0.75;

export const LIFTS: LiftMeta[] = DEFS.map((d) => ({
  ...d,
  weight: weightFor(d),
  scored: true,
  aliases: ALIASES[d.id] ?? [],
}));

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

/* ----------------------- Female factors by family (§4.2b) ---------------------- */

function familyOf(d: Def): 'squat' | 'press' | 'pull' {
  if (d.group === 'lower') return 'squat';
  if (d.bodyPart === 'Back') return 'pull';
  if (d.bodyPart === 'Arms') return d.id.includes('curl') ? 'pull' : 'press';
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
