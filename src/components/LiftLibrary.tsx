import { useMemo, useState } from 'react';
import { useQuiz } from '../state/QuizContext';
import {
  BODY_PART_ORDER,
  CUSTOM_PREFIX,
  LIFTS,
  LIFTS_BY_BODY_PART,
  LIFT_BY_ID,
  type BodyPart,
  type LiftMeta,
} from '../data/standards';
import { isLiftEntered } from '../state/quizReducer';
import { LiftCard } from './LiftCard';

/** Fuzzy score: substring on name/aliases (primary) + per-word + reverse-alias. */
function matchScore(l: LiftMeta, q: string): number {
  const hay = `${l.name} ${l.aliases.join(' ')}`.toLowerCase();
  let sc = 0;
  if (hay.includes(q)) sc += 100 + (l.name.toLowerCase().startsWith(q) ? 20 : 0);
  for (const w of q.split(/\s+/).filter((w) => w.length >= 2)) if (hay.includes(w)) sc += 6;
  for (const a of l.aliases) if (a.length >= 3 && q.includes(a)) sc += 10;
  return sc;
}

/** Loose bigram overlap, for suggesting a closest match on a true miss. */
function looseClosest(addable: LiftMeta[], q: string): LiftMeta | null {
  let best: LiftMeta | null = null;
  let bestScore = 0;
  for (const l of addable) {
    const hay = `${l.name} ${l.aliases.join(' ')}`.toLowerCase();
    let sc = 0;
    for (let i = 0; i < q.length - 1; i++) {
      const bg = q.slice(i, i + 2);
      if (bg.trim().length === 2 && hay.includes(bg)) sc++;
    }
    if (sc > bestScore) {
      bestScore = sc;
      best = l;
    }
  }
  // Only suggest when reasonably close; a wrong "closest match" reads worse than none.
  return bestScore >= 5 ? best : null;
}

/** Fire-and-forget capture of a zero-result search term (shows up in Vercel logs). */
function captureMiss(term: string) {
  try {
    fetch(`/api/miss?q=${encodeURIComponent(term)}`, { method: 'POST', keepalive: true }).catch(() => {});
  } catch {
    /* never block the user */
  }
}

// Phrase for the lift the user should add to fill the MISSING region.
const GROUP_NOTE: Record<'upper' | 'lower', string> = { upper: 'a press', lower: 'a leg' };

export function LiftLibrary() {
  const { state, dispatch } = useQuiz();
  const [query, setQuery] = useState('');
  const [browseOpen, setBrowseOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<BodyPart>>(new Set());

  const active = new Set(state.order);
  const addableAll = LIFTS.filter((l) => !active.has(l.id));
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return addableAll
      .map((l) => ({ l, sc: matchScore(l, q) }))
      .filter((x) => x.sc > 0)
      .sort((a, b) => b.sc - a.sc)
      .slice(0, 8)
      .map((x) => x.l);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, state.order]);

  const suggestion = q && results.length === 0 ? looseClosest(addableAll, q) : null;

  // Soft type-unlock note (never a gate): need a compound upper AND lower entered.
  const enteredCompoundGroups = useMemo(() => {
    const set = new Set<'upper' | 'lower'>();
    for (const id of state.order) {
      const m = LIFT_BY_ID[id];
      if (m && m.kind === 'compound' && isLiftEntered(id, state.lifts[id])) set.add(m.group);
    }
    return set;
  }, [state.order, state.lifts]);
  const hasAnyScored = state.order.some((id) => LIFT_BY_ID[id] && isLiftEntered(id, state.lifts[id]));
  const missingGroup: 'upper' | 'lower' | null =
    enteredCompoundGroups.has('upper') && enteredCompoundGroups.has('lower')
      ? null
      : enteredCompoundGroups.has('upper')
        ? 'lower'
        : enteredCompoundGroups.has('lower')
          ? 'upper'
          : null;

  const add = (id: string) => {
    dispatch({ type: 'ADD_LIFT', id });
    setQuery('');
  };
  const addCustom = () => {
    const label = query.trim().replace(/\s+/g, ' ');
    if (!label) return;
    captureMiss(label);
    dispatch({ type: 'ADD_LIFT', id: CUSTOM_PREFIX + label });
    setQuery('');
  };

  const toggle = (bp: BodyPart) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(bp) ? next.delete(bp) : next.add(bp);
      return next;
    });

  const resultRow = (l: LiftMeta) => (
    <button
      key={l.id}
      onClick={() => add(l.id)}
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-raised px-3 py-2.5 text-left transition-colors hover:border-accent"
    >
      <span className="text-[14px] font-medium text-text">{l.name}</span>
      <span className="font-mono text-[10px] uppercase tracking-wide text-textmut">
        {l.bodyPart}
        {l.kind === 'isolation' ? ' · iso' : ''}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {/* SEARCH — anchored at the top, the primary add path */}
      <div className="flex items-center rounded-xl border border-line bg-raised px-3 focus-within:border-accent">
        <span className="text-textmut">⌕</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a lift to add (bench, rdl, lat pulldown…)"
          aria-label="Search lifts to add"
          className="w-full bg-transparent px-2 py-3 text-[15px] text-text outline-none placeholder:text-textmut"
        />
        {query && (
          <button aria-label="Clear search" onClick={() => setQuery('')} className="px-1 text-lg leading-none text-textmut hover:text-text">
            ×
          </button>
        )}
      </div>

      {q && (
        <div className="ir-fade-up flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-2">
          {results.map(resultRow)}

          {results.length === 0 && (
            <div className="px-1 py-1.5">
              {suggestion ? (
                <p className="text-[13px] text-text2">
                  We don’t track <span className="text-text">“{query.trim()}”</span> yet — closest
                  match:
                </p>
              ) : (
                <p className="text-[13px] text-text2">
                  No match for <span className="text-text">“{query.trim()}”</span> yet.
                </p>
              )}
              {suggestion && <div className="mt-1.5">{resultRow(suggestion)}</div>}
              <button
                onClick={addCustom}
                className="mt-2 w-full rounded-lg border border-dashed border-accent/50 bg-accent/5 px-3 py-2.5 text-[13px] font-semibold text-text transition-colors hover:bg-accent/10"
              >
                + Add “{query.trim()}” anyway <span className="text-textmut">(logged, not ranked)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE LIFT CARDS */}
      {state.order.map((id) => (
        <LiftCard key={id} id={id} />
      ))}

      {/* Soft type-unlock upsell — never blocks finishing */}
      {hasAnyScored && missingGroup && (
        <p className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-2.5 text-center text-[13px] text-text2">
          You’ll still get a card — add <span className="text-text">{GROUP_NOTE[missingGroup]}</span>{' '}
          lift to reveal your full Lifter Type.
        </p>
      )}

      {/* BROWSE ALL — secondary, collapsible, grouped by body part */}
      {addableAll.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setBrowseOpen((o) => !o)}
            aria-expanded={browseOpen}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-transparent py-2.5 text-[13px] font-semibold text-text2 transition-colors hover:border-accent hover:text-text"
          >
            {browseOpen ? 'Hide catalog' : `Browse all lifts (${addableAll.length})`}
          </button>

          {browseOpen && (
            <div className="ir-fade-up mt-2 flex max-h-[42vh] flex-col gap-1 overflow-y-auto rounded-xl border border-line bg-surface p-3">
              {BODY_PART_ORDER.map((bp) => {
                const lifts = LIFTS_BY_BODY_PART[bp].filter((l) => !active.has(l.id));
                if (lifts.length === 0) return null;
                const open = expanded.has(bp);
                return (
                  <div key={bp}>
                    <button
                      onClick={() => toggle(bp)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-raised"
                    >
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{bp}</span>
                      <span className="font-mono text-[11px] text-textmut">{lifts.length} {open ? '▾' : '▸'}</span>
                    </button>
                    {open && (
                      <div className="mt-1 grid grid-cols-2 gap-2 pb-2">
                        {lifts.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => add(l.id)}
                            className="flex items-center justify-between gap-1 rounded-lg border border-line bg-raised px-3 py-2.5 text-left text-[13px] font-medium text-text2 transition-colors hover:border-accent hover:text-text"
                          >
                            <span>{l.name}</span>
                            {l.kind === 'isolation' && (
                              <span className="font-mono shrink-0 text-[8px] uppercase tracking-wide text-textmut">iso</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
