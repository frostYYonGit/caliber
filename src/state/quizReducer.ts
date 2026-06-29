/** Onboarding state + actions (§2). Persisted across Back so nothing is lost. */
import type { LiftId, Population, Sex } from '../data/standards';
import { DEFAULT_LIFTS, LIFT_BY_ID, isScored } from '../data/standards';
import type { Unit } from '../lib/units';

/** Epley is only reliable to ~10–12 reps; we cap the stepper there (§4.1). */
export const MAX_REPS = 12;

export interface LiftDraft {
  weight: string; // raw input in the current unit
  reps: number;
}

export interface QuizState {
  step: number; // 0..3 across the 4 input steps
  sex: Sex | null;
  unit: Unit;
  age: string;
  bodyweight: string;
  population: Population;
  order: LiftId[];
  lifts: Partial<Record<LiftId, LiftDraft>>;
}

export const STEP_COUNT = 4;

export const initialState: QuizState = {
  step: 0,
  sex: null,
  unit: 'kg',
  age: '',
  bodyweight: '',
  population: 'gym', // sensible default for cold, curious traffic
  order: [...DEFAULT_LIFTS],
  lifts: Object.fromEntries(DEFAULT_LIFTS.map((id) => [id, { weight: '', reps: 5 }])),
};

export type Action =
  | { type: 'SET_SEX'; sex: Sex }
  | { type: 'SET_UNIT'; unit: Unit }
  | { type: 'SET_AGE'; age: string }
  | { type: 'SET_BODYWEIGHT'; bodyweight: string }
  | { type: 'SET_POPULATION'; population: Population }
  | { type: 'ADD_LIFT'; id: LiftId }
  | { type: 'REMOVE_LIFT'; id: LiftId }
  | { type: 'SET_LIFT_WEIGHT'; id: LiftId; weight: string }
  | { type: 'SET_LIFT_REPS'; id: LiftId; reps: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GOTO'; step: number }
  | { type: 'RESET' };

export function quizReducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'SET_SEX':
      return { ...state, sex: action.sex };
    case 'SET_UNIT':
      return { ...state, unit: action.unit };
    case 'SET_AGE':
      return { ...state, age: action.age };
    case 'SET_BODYWEIGHT':
      return { ...state, bodyweight: action.bodyweight };
    case 'SET_POPULATION':
      return { ...state, population: action.population };
    case 'ADD_LIFT': {
      if (state.order.includes(action.id)) return state;
      return {
        ...state,
        order: [...state.order, action.id],
        lifts: { ...state.lifts, [action.id]: { weight: '', reps: 5 } },
      };
    }
    case 'REMOVE_LIFT': {
      const { [action.id]: _removed, ...rest } = state.lifts;
      return {
        ...state,
        order: state.order.filter((id) => id !== action.id),
        lifts: rest,
      };
    }
    case 'SET_LIFT_WEIGHT':
      return {
        ...state,
        lifts: {
          ...state.lifts,
          [action.id]: { ...state.lifts[action.id]!, weight: action.weight },
        },
      };
    case 'SET_LIFT_REPS':
      return {
        ...state,
        lifts: {
          ...state.lifts,
          [action.id]: {
            ...state.lifts[action.id]!,
            reps: Math.max(1, Math.min(MAX_REPS, action.reps)),
          },
        },
      };
    case 'NEXT':
      return { ...state, step: Math.min(STEP_COUNT - 1, state.step + 1) };
    case 'BACK':
      return { ...state, step: Math.max(0, state.step - 1) };
    case 'GOTO':
      return { ...state, step: Math.max(0, Math.min(STEP_COUNT - 1, action.step)) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

/* ------------------------------- Derived helpers ------------------------------ */

export const parseNum = (str: string): number => {
  const n = parseFloat(str);
  return Number.isFinite(n) ? n : NaN;
};

/** Is a single lift draft a valid, scored entry? */
export function isLiftEntered(id: LiftId, draft: LiftDraft | undefined): boolean {
  if (!draft) return false;
  const w = parseNum(draft.weight);
  if (!Number.isFinite(w)) return false;
  const meta = LIFT_BY_ID[id];
  if (!meta) return false;
  return meta.addedLoad ? w >= 0 : w > 0;
}

/** At least one *scored* lift entered — tracked-only lifts can't get you ranked. */
export function hasScoredEntry(state: QuizState): boolean {
  return state.order.some((id) => isScored(id) && isLiftEntered(id, state.lifts[id]));
}

/** Per-step validity gate for the Continue button (§2). */
export function isStepValid(state: QuizState): boolean {
  switch (state.step) {
    case 0:
      return state.sex !== null; // unit always has a default
    case 1: {
      const a = parseNum(state.age);
      const w = parseNum(state.bodyweight);
      return Number.isFinite(a) && a >= 13 && a <= 80 && Number.isFinite(w) && w > 0;
    }
    case 2:
      return hasScoredEntry(state);
    case 3:
      return state.population !== null;
    default:
      return false;
  }
}
