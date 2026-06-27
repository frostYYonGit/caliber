/**
 * URL state for shareable result links (§6.2/6.3). A result encodes to
 * /r?... so the exact card can be rebuilt with no onboarding, and the same
 * params drive the dynamic OG image at /api/og.
 *
 * Weights are stored in kg (the scoring unit) for lossless reconstruction;
 * the chosen display unit is carried separately.
 */
import type { Population, Sex } from '../data/standards';
import { LIFT_BY_ID, type LiftId } from '../data/standards';
import type { Unit } from './units';
import type { IronRankResult, ResolvedInput } from './result';
import { buildResult } from './result';

const SEX_TO: Record<Sex, string> = { male: 'm', female: 'f' };
const SEX_FROM: Record<string, Sex> = { m: 'male', f: 'female' };
const POP_TO: Record<Population, string> = { general: 'gen', gym: 'gym', serious: 'ser' };
const POP_FROM: Record<string, Population> = {
  gen: 'general',
  gym: 'gym',
  ser: 'serious',
};

const r2 = (n: number): string => String(Math.round(n * 100) / 100);

/** Denormalized display fields the OG route can render without recomputing. */
export interface Denorm {
  score: number;
  tier: string;
  pct: number;
  dots: number | null;
  dotsLabel: string | null;
}

export function encodeResult(result: IronRankResult): string {
  const { input, composite, dots } = result;
  const p = new URLSearchParams();
  p.set('s', SEX_TO[input.sex]);
  p.set('a', String(input.age));
  p.set('u', input.unit);
  p.set('w', r2(input.bodyweightKg));
  p.set('p', POP_TO[input.population]);
  p.set(
    'L',
    input.entries.map((e) => `${e.id}~${r2(e.weightKg)}~${e.reps}`).join(','),
  );
  // Denormalized for OG / fast preview.
  p.set('sc', String(composite.strengthScore));
  p.set('ti', composite.overallTier);
  p.set('pc', String(Math.round(composite.overallPct)));
  if (result.archetype) p.set('ar', result.archetype.id);
  if (dots) {
    p.set('do', String(Math.round(dots.score)));
    p.set('dl', dots.label);
  }
  return p.toString();
}

export function resultPath(result: IronRankResult): string {
  return `/r?${encodeResult(result)}`;
}

export function resultUrl(result: IronRankResult, origin: string): string {
  return `${origin}/r?${encodeResult(result)}`;
}

export function ogImageUrl(result: IronRankResult, origin: string): string {
  return `${origin}/api/og?${encodeResult(result)}`;
}

/** Parse query params back into resolved scoring input. Returns null if invalid. */
export function decodeInput(params: URLSearchParams): ResolvedInput | null {
  const sex = SEX_FROM[params.get('s') ?? ''];
  const population = POP_FROM[params.get('p') ?? ''];
  const age = Number(params.get('a'));
  const bodyweightKg = Number(params.get('w'));
  const unit = (params.get('u') as Unit) ?? 'kg';
  const L = params.get('L') ?? '';
  if (!sex || !population || !Number.isFinite(age) || !(bodyweightKg > 0)) return null;

  const entries = L.split(',')
    .map((chunk) => {
      const [id, w, repsRaw] = chunk.split('~');
      const reps = Math.max(1, Math.min(12, Number(repsRaw) || 1));
      return { id: id as LiftId, weightKg: Number(w), reps };
    })
    .filter((e) => e.id && LIFT_BY_ID[e.id] && Number.isFinite(e.weightKg));
  if (entries.length === 0) return null;

  return {
    sex,
    age,
    bodyweightKg,
    population,
    unit: unit === 'lb' ? 'lb' : 'kg',
    entries,
  };
}

/** Decode a full result from a URL (recomputes from inputs — authoritative). */
export function decodeResult(params: URLSearchParams): IronRankResult | null {
  const input = decodeInput(params);
  if (!input) return null;
  return buildResult(input);
}

export function readDenorm(params: URLSearchParams): Denorm | null {
  const sc = Number(params.get('sc'));
  if (!Number.isFinite(sc)) return null;
  const doRaw = params.get('do');
  return {
    score: sc,
    tier: params.get('ti') ?? '',
    pct: Number(params.get('pc')) || 0,
    dots: doRaw !== null ? Number(doRaw) : null,
    dotsLabel: params.get('dl'),
  };
}
