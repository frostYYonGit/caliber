import { useEffect, useMemo, useRef, useState } from 'react';
import { QuizProvider, useQuiz } from '../state/QuizContext';
import { isStepValid, parseNum, STEP_COUNT } from '../state/quizReducer';
import { trackEvent } from '../lib/analytics';
import { resultEventProps } from '../lib/analytics-result';
import { Progress } from '../components/Progress';
import { PrimaryButton, GhostButton } from '../components/ui';
import { SexUnits } from '../components/steps/SexUnits';
import { AgeWeight } from '../components/steps/AgeWeight';
import { Lifts } from '../components/steps/Lifts';
import { Population } from '../components/steps/Population';
import { Analyzing } from '../components/Analyzing';
import { ResultView } from '../components/ResultView';
import { Shell } from '../components/Shell';
import { TAGLINE } from '../config';
import { buildResult, resolveQuiz, type IronRankResult } from '../lib/result';
import { decodeResult, resultPathVs } from '../lib/share';
import { takeChallenger } from '../lib/nav';

const STEP_COMPONENTS = [SexUnits, AgeWeight, Lifts, Population];
const STEP_NAMES = ['sex_units', 'age_bodyweight', 'lifts', 'compare'];

type Phase = 'quiz' | 'analyzing' | 'result';

/**
 * The 4-step funnel + analyzing + result. Lazy-loaded by App when the visitor
 * taps "Find my type" on the landing — this is where the scoring engine,
 * html-to-image and the rest of the heavy code finally enter the bundle.
 */
function QuizFlow() {
  const { state, dispatch } = useQuiz();
  const [phase, setPhase] = useState<Phase>('quiz');
  const [result, setResult] = useState<IronRankResult | null>(null);
  const [opponent, setOpponent] = useState<IronRankResult | null>(null);

  // The funnel has begun the moment this chunk mounts (CTA was tapped on landing).
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    trackEvent('onboarding_started', {
      starting_step: STEP_NAMES[0],
      units: state.unit,
      comparison_population: state.population,
    });
  }, [state.unit, state.population]);

  const valid = useMemo(() => isStepValid(state), [state]);
  const isLast = state.step === STEP_COUNT - 1;
  const StepComp = STEP_COMPONENTS[state.step];

  const quizProps = () => ({
    units: state.unit,
    sex: state.sex ?? undefined,
    age: Number.isFinite(parseNum(state.age)) ? parseNum(state.age) : undefined,
    bodyweight: Number.isFinite(parseNum(state.bodyweight)) ? parseNum(state.bodyweight) : undefined,
    comparison_population: state.population,
  });

  const onContinue = () => {
    if (!valid) return;
    trackEvent('step_completed', {
      step_name: STEP_NAMES[state.step],
      step_index: state.step,
      ...quizProps(),
    });
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
    // If this run was a response to a challenge, attach the challenger (consumed).
    const challengerEnc = takeChallenger();
    const opp = challengerEnc ? decodeResult(new URLSearchParams(challengerEnc)) : null;
    setResult(r);
    setOpponent(opp);
    // result_generated fires once here (on generation), not on card re-render.
    trackEvent('result_generated', { ...resultEventProps(r), source: opp ? 'challenge_response' : 'self' });
    // Update URL so the result (+ head-to-head) is shareable / refresh-safe (§6.2).
    window.history.pushState({}, '', resultPathVs(r, opp));
    setPhase('result');
    window.scrollTo(0, 0);
  };

  const startOver = () => {
    dispatch({ type: 'RESET' });
    setResult(null);
    setOpponent(null);
    window.history.pushState({}, '', '/');
    setPhase('quiz');
    window.scrollTo(0, 0);
  };

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
        <ResultView result={result} opponent={opponent} onStartOver={startOver} />
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

export default function Quiz() {
  return (
    <QuizProvider>
      <QuizFlow />
    </QuizProvider>
  );
}
