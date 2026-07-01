/**
 * Head-to-head comparison of two results (you vs a friend). Pure — reads the two
 * already-computed results and returns a verdict + per-lift duel. No accounts,
 * no backend: both results come from URL state.
 */
import { LIFT_BY_ID, type LiftId } from '../data/standards';
import type { IronRankResult } from './result';

export type Outcome = 'win' | 'lose' | 'tie';

export interface LiftDuel {
  id: LiftId;
  name: string;
  youPct: number;
  themPct: number;
  winner: 'you' | 'them' | 'tie';
}

export interface Compare {
  youScore: number;
  themScore: number;
  youPct: number;
  themPct: number;
  outcome: Outcome;
  /** Short banner verdict, from *your* point of view. */
  verdict: string;
  /** Common scored lifts both entered, so a per-lift argument is possible. */
  lifts: LiftDuel[];
}

const VERDICT: Record<Outcome, string> = {
  win: 'You win',
  lose: 'They win',
  tie: 'Dead even',
};

export function compareResults(you: IronRankResult, them: IronRankResult): Compare {
  const youScore = you.composite.strengthScore;
  const themScore = them.composite.strengthScore;
  const outcome: Outcome = youScore > themScore ? 'win' : youScore < themScore ? 'lose' : 'tie';

  const themByLift = new Map(them.lifts.map((l) => [l.id, l.percentile]));
  const lifts: LiftDuel[] = [];
  for (const l of you.lifts) {
    const tp = themByLift.get(l.id);
    if (tp === undefined) continue;
    lifts.push({
      id: l.id,
      name: LIFT_BY_ID[l.id]?.name ?? l.id,
      youPct: l.percentile,
      themPct: tp,
      winner: l.percentile > tp ? 'you' : l.percentile < tp ? 'them' : 'tie',
    });
  }

  return {
    youScore,
    themScore,
    youPct: you.composite.overallPct,
    themPct: them.composite.overallPct,
    outcome,
    verdict: VERDICT[outcome],
    lifts,
  };
}
