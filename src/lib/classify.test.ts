import { describe, it, expect } from 'vitest';
import { classify, telemetryLabel } from './classify';
import { ARCHETYPES } from '../data/archetypes';
import type { LiftId } from '../data/standards';
import type { LiftResult } from './scoring';

/** Minimal LiftResult — classify only reads id + percentile. */
const lr = (id: LiftId, percentile: number): LiftResult => ({
  id,
  percentile,
  oneRMkg: 0,
  ratio: 0,
  adjustedRatio: 0,
  tier: 'Intermediate',
});

describe('classify — every branch (Edit 2)', () => {
  it('Different Breed: elite & balanced', () => {
    const lifts = [lr('bench_press', 92), lr('overhead_press', 90), lr('deadlift', 94), lr('back_squat', 90)];
    expect(classify(lifts, 92)!.id).toBe('different_breed');
  });

  it('Prospect: weak overall, with an UPPER lean flavor', () => {
    const lifts = [lr('bench_press', 40), lr('back_squat', 20)];
    const c = classify(lifts, 30)!;
    expect(c.id).toBe('prospect');
    expect(c.lean).toBe('upper');
    expect(telemetryLabel(c, ARCHETYPES.prospect.telemetry)).toBe('EARLY · UPPER-LEAN');
  });

  it('Glass Cannon: upper peaked, legs weak (not a specialist)', () => {
    const lifts = [lr('bench_press', 80), lr('overhead_press', 78), lr('back_squat', 40), lr('deadlift', 42)];
    expect(classify(lifts, 62)!.id).toBe('glass_cannon');
  });

  it('Mirror Athlete: mild upper lean', () => {
    const lifts = [lr('bench_press', 75), lr('overhead_press', 70), lr('back_squat', 55), lr('deadlift', 57)];
    expect(classify(lifts, 65)!.id).toBe('mirror_athlete');
  });

  it('The Mule: lower peaked', () => {
    const lifts = [lr('deadlift', 85), lr('back_squat', 80), lr('bench_press', 45), lr('overhead_press', 40)];
    expect(classify(lifts, 64)!.id).toBe('the_mule');
  });

  it('Powerbuilder: balanced, mid (fallback)', () => {
    const lifts = [lr('bench_press', 65), lr('overhead_press', 60), lr('back_squat', 66), lr('deadlift', 64)];
    expect(classify(lifts, 64)!.id).toBe('powerbuilder');
  });

  it('Specialist — Deadlift Demon', () => {
    const lifts = [lr('deadlift', 90), lr('back_squat', 62), lr('bench_press', 60), lr('overhead_press', 58)];
    expect(classify(lifts, 70)!.id).toBe('deadlift_demon');
  });

  it('Specialist — Squat Monster', () => {
    const lifts = [lr('back_squat', 92), lr('deadlift', 65), lr('bench_press', 63), lr('overhead_press', 60)];
    expect(classify(lifts, 72)!.id).toBe('squat_monster');
  });

  it('Specialist — Bench Boss', () => {
    const lifts = [lr('bench_press', 90), lr('deadlift', 64), lr('back_squat', 62), lr('overhead_press', 58)];
    expect(classify(lifts, 70)!.id).toBe('bench_boss');
  });

  it('Specialist — Press Machine', () => {
    const lifts = [lr('overhead_press', 85), lr('bench_press', 60), lr('back_squat', 58), lr('deadlift', 60)];
    expect(classify(lifts, 66)!.id).toBe('press_machine');
  });
});

describe('classify — unlock rule', () => {
  it('returns null without both an upper and a lower lift', () => {
    expect(classify([lr('bench_press', 80), lr('overhead_press', 70)], 75)).toBeNull();
    expect(classify([lr('back_squat', 80), lr('deadlift', 70)], 75)).toBeNull();
  });

  it('a strong single specialist does not preempt a balanced elite', () => {
    // best beats second by < 25 -> not a specialist
    const lifts = [lr('deadlift', 94), lr('back_squat', 92), lr('bench_press', 90), lr('overhead_press', 90)];
    expect(classify(lifts, 92)!.id).toBe('different_breed');
  });
});
