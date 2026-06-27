import { useMemo, useState } from 'react';
import { useQuiz } from '../state/QuizContext';
import {
  BODY_PART_ORDER,
  LIFTS_BY_BODY_PART,
  LIFT_BY_ID,
  LIFTS,
  type BodyPart,
} from '../data/standards';
import { isLiftEntered } from '../state/quizReducer';
import { LiftCard } from './LiftCard';

/** Active lift cards + a searchable, body-part accordion Add menu (Edit A3). */
export function LiftLibrary() {
  const { state, dispatch } = useQuiz();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<BodyPart>>(new Set());

  const active = new Set(state.order);
  const totalAddable = LIFTS.length - state.order.length;

  // Type unlock: need a COMPOUND upper and a COMPOUND lower entered.
  const enteredCompoundGroups = useMemo(() => {
    const set = new Set<'upper' | 'lower'>();
    for (const id of state.order) {
      const m = LIFT_BY_ID[id];
      if (m.kind === 'compound' && isLiftEntered(id, state.lifts[id])) set.add(m.group);
    }
    return set;
  }, [state.order, state.lifts]);
  const anyEntered = state.order.some((id) => isLiftEntered(id, state.lifts[id]));
  const bothEnds = enteredCompoundGroups.has('upper') && enteredCompoundGroups.has('lower');

  const q = query.trim().toLowerCase();
  const sections = BODY_PART_ORDER.map((bp) => ({
    bodyPart: bp,
    lifts: LIFTS_BY_BODY_PART[bp].filter(
      (l) => !active.has(l.id) && (q === '' || l.name.toLowerCase().includes(q)),
    ),
  })).filter((sec) => sec.lifts.length > 0);

  const toggle = (bp: BodyPart) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(bp) ? next.delete(bp) : next.add(bp);
      return next;
    });

  return (
    <div className="flex flex-col gap-2.5">
      {state.order.length === 0 && (
        <p className="rounded-xl border border-dashed border-line bg-surface px-4 py-5 text-center text-sm text-text2">
          No lifts yet — add the ones you actually train below.
        </p>
      )}

      {state.order.map((id) => (
        <LiftCard key={id} id={id} />
      ))}

      {/* Type unlock feedback (Edit B) */}
      {bothEnds ? (
        <p className="rounded-xl border px-4 py-2.5 text-center text-[13px] text-text2"
          style={{ borderColor: 'rgba(95,208,138,0.4)', background: 'rgba(95,208,138,0.07)' }}>
          Both ends covered — <span className="text-text">your type’s coming into focus.</span>
        </p>
      ) : (
        anyEntered && (
          <p className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-2.5 text-center text-[13px] text-text2">
            Add an <span className="text-text">upper</span> and a{' '}
            <span className="text-text">lower</span> compound to reveal your Lifter Type.
          </p>
        )
      )}

      {totalAddable > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-transparent py-3 text-sm font-semibold text-text2 transition-colors hover:border-accent hover:text-text"
          >
            <span className="text-accent">+</span>
            {open ? 'Done adding' : `Add lift (${totalAddable} more)`}
          </button>

          {open && (
            <div className="ir-fade-up mt-2 rounded-xl border border-line bg-surface p-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lifts…"
                aria-label="Search lifts"
                className="mb-3 w-full rounded-lg border border-line bg-raised px-3 py-2.5 text-sm text-text outline-none placeholder:text-textmut focus:border-accent"
              />

              <div className="flex max-h-[44vh] flex-col gap-1.5 overflow-y-auto pr-1">
                {sections.length === 0 && (
                  <p className="py-4 text-center text-sm text-textmut">No matching lifts.</p>
                )}
                {sections.map(({ bodyPart, lifts }) => {
                  const isOpen = q !== '' || expanded.has(bodyPart);
                  return (
                    <div key={bodyPart}>
                      <button
                        onClick={() => toggle(bodyPart)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-raised"
                      >
                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                          {bodyPart}
                        </span>
                        <span className="font-mono text-[11px] text-textmut">
                          {lifts.length} {q === '' ? (isOpen ? '▾' : '▸') : ''}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="mt-1 grid grid-cols-2 gap-2 pb-2">
                          {lifts.map((l) => (
                            <button
                              key={l.id}
                              onClick={() => dispatch({ type: 'ADD_LIFT', id: l.id })}
                              className="flex items-center justify-between gap-1 rounded-lg border border-line bg-raised px-3 py-2.5 text-left text-[13px] font-medium text-text2 transition-colors hover:border-accent hover:text-text"
                            >
                              <span>{l.name}</span>
                              {l.kind === 'isolation' && (
                                <span className="font-mono shrink-0 text-[8px] uppercase tracking-wide text-textmut">
                                  iso
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
