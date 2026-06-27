import { StepShell } from '../ui';
import { LiftLibrary } from '../LiftLibrary';

export function Lifts() {
  return (
    <StepShell
      kicker="Step 3 · Your lifts"
      title="What can you lift?"
      subtitle="Add whatever you train — the big three are pre-loaded but removable. Enter your best set; we estimate your 1RM live. One scored lift is enough to get ranked."
    >
      <LiftLibrary />
    </StepShell>
  );
}
