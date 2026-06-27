import { useMemo, useState, type ReactNode } from 'react';
import { useQuiz } from '../state/QuizContext';
import { isStepValid, STEP_COUNT } from '../state/quizReducer';
import { Progress } from '../components/Progress';
import { PrimaryButton, GhostButton } from '../components/ui';
import { SexUnits } from '../components/steps/SexUnits';
import { AgeWeight } from '../components/steps/AgeWeight';
import { Lifts } from '../components/steps/Lifts';
import { Population } from '../components/steps/Population';
import { Analyzing } from '../components/Analyzing';
import { ResultView } from '../components/ResultView';
import { Intro } from '../components/Intro';
import { TAGLINE } from '../config';
import { buildResult, resolveQuiz, type IronRankResult } from '../lib/result';
import { resultPath } from '../lib/share';

const STEP_COMPONENTS = [SexUnits, AgeWeight, Lifts, Population];

type Phase = 'intro' | 'quiz' | 'analyzing' | 'result';

export function Home() {
  const { state, dispatch } = useQuiz();
  const [phase, setPhase] = useState<Phase>('intro');
  const [result, setResult] = useState<IronRankResult | null>(null);

  const valid = useMemo(() => isStepValid(state), [state]);
  const isLast = state.step === STEP_COUNT - 1;
  const StepComp = STEP_COMPONENTS[state.step];

  const onContinue = () => {
    if (!valid) return;
    if (isLast) {
      setPhase('analyzing');
    } else {
      dispatch({ type: 'NEXT' });
    }
  };

  const finishAnalyzing = () => {
    const input = resolveQuiz(state);
    if (!input) {
      setPhase('quiz');
      return;
    }
    const r = buildResult(input);
    setResult(r);
    // Update URL so the result is shareable / refresh-safe (§6.2).
    window.history.pushState({}, '', resultPath(r));
    setPhase('result');
    window.scrollTo(0, 0);
  };

  const startOver = () => {
    dispatch({ type: 'RESET' });
    setResult(null);
    window.history.pushState({}, '', '/');
    setPhase('intro');
    window.scrollTo(0, 0);
  };

  if (phase === 'intro') {
    return (
      <Shell>
        <Intro onStart={() => setPhase('quiz')} />
      </Shell>
    );
  }

  if (phase === 'analyzing') {
    return (
      <Shell>
        <Analyzing onDone={finishAnalyzing} />
      </Shell>
    );
  }

  if (phase === 'result' && result) {
    return (
      <Shell>
        <ResultView result={result} onStartOver={startOver} />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="pt-2">
        <Progress step={state.step} total={STEP_COUNT} />
      </div>

      {state.step === 0 && (
        <p className="font-display mt-6 text-center text-sm font-bold uppercase tracking-[0.2em] text-textmut">
          {TAGLINE}
        </p>
      )}

      {/* pb clears the sticky footer so the last lift card is never covered. */}
      <div className="flex-1 pt-6 pb-28">
        <StepComp />
      </div>

      <div className="sticky bottom-0 -mx-5 border-t border-line bg-bg px-5 pb-5 pt-4">
        <div className="flex gap-2.5">
          {state.step > 0 && (
            <GhostButton onClick={() => dispatch({ type: 'BACK' })} aria-label="Back">
              Back
            </GhostButton>
          )}
          <PrimaryButton onClick={onContinue} disabled={!valid}>
            {isLast ? 'Get my rank →' : 'Continue'}
          </PrimaryButton>
        </div>
      </div>
    </Shell>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="app-bg min-h-dvh w-full">
      <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-5">
        {children}
      </div>
    </div>
  );
}
