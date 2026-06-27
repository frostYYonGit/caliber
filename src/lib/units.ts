/** kg/lb conversion + display rounding. All scoring math runs in kg (§4). */

export type Unit = 'kg' | 'lb';

export const LB_PER_KG = 2.2046226;

export const lbToKg = (lb: number): number => lb / LB_PER_KG;
export const kgToLb = (kg: number): number => kg * LB_PER_KG;

/** Convert a user-entered weight (in their chosen unit) to kg for scoring. */
export const toKg = (value: number, unit: Unit): number =>
  unit === 'kg' ? value : lbToKg(value);

/** Convert a kg value back to the user's unit for display. */
export const fromKg = (kg: number, unit: Unit): number =>
  unit === 'kg' ? kg : kgToLb(kg);

/** Round a displayed weight to a sensible plate increment for the unit. */
export const roundWeight = (value: number, unit: Unit): number => {
  const step = unit === 'kg' ? 1 : 1;
  return Math.round(value / step) * step;
};

/** Format a kg value for display in the chosen unit, e.g. "142 kg" / "313 lb". */
export const formatWeight = (kg: number, unit: Unit): string =>
  `${roundWeight(fromKg(kg, unit), unit)} ${unit}`;

export const unitLabel = (unit: Unit): string => unit.toUpperCase();
