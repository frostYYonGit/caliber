import { useState } from 'react';
import { useQuiz } from '../state/QuizContext';
import { ADDABLE_BY_GROUP, LIFT_BY_ID, LIFTS, type Group } from '../data/standards';
import { isLiftEntered } from '../state/quizReducer';
import { LiftCard } from './LiftCard';

const GROUP_LABEL: Record<Group, string> = { upper: 'Upper body', lower: 'Lower body' };

/** Active lift cards + an Add menu grouped Upper / Lower (§3b). */
export function LiftLibrary() {
  const { state, dispatch } = useQuiz();
  const [open, setOpen] = useState(false);

  const active = new Set(state.order);
  const totalAddable = LIFTS.length - state.order.length;

  // Type-unlock hint: a full Lifter Type needs one upper AND one lower entered.
  const enteredGroups = new Set(
    state.order
      .filter((id) => isLiftEntered(id, state.lifts[id]))
      .map((id) => LIFT_BY_ID[id].group),
  );
  const needsBoth = enteredGroups.size > 0 && !(enteredGroups.has('upper') && enteredGroups.has('lower'));

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

      {needsBoth && (
        <p className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-2.5 text-center text-[13px] text-text2">
          Add at least one <span className="text-text">upper</span> and one{' '}
          <span className="text-text">lower</span> lift to reveal your Lifter Type.
        </p>
      )}

      {totalAddable > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-transparent py-3 text-sm font-semibold text-text2 transition-colors hover:border-accent hover:text-text"
          >
            <span className="text-accent">+</span>
            {open ? 'Done adding' : 'Add lift'}
          </button>

          {open && (
            <div className="ir-fade-up mt-2 flex flex-col gap-3 rounded-xl border border-line bg-surface p-3">
              {(['lower', 'upper'] as Group[]).map((group) => {
                const lifts = ADDABLE_BY_GROUP[group].filter((l) => !active.has(l.id));
                if (lifts.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="font-mono mb-1.5 text-[10px] uppercase tracking-[0.18em] text-accent">
                      {GROUP_LABEL[group]}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {lifts.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => dispatch({ type: 'ADD_LIFT', id: l.id })}
                          className="rounded-lg border border-line bg-raised px-3 py-2.5 text-left text-[13px] font-medium text-text2 transition-colors hover:border-accent hover:text-text"
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
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
