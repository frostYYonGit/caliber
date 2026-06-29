import { StepShell } from '../ui';
import { LiftLibrary } from '../LiftLibrary';

export function Lifts() {
  return (
    <StepShell
      kicker="Step 3 · Your lifts"
      title="Last step — drop your numbers"
      subtitle="Your lifts are pre-loaded — just type the weight. Search to add anything else. One lift is enough to get your card."
    >
      <LiftLibrary />
    </StepShell>
  );
}
