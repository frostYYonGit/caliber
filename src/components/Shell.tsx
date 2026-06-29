import type { ReactNode } from 'react';

/** The app frame: full-height molten canvas with a centered mobile column. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="app-bg min-h-dvh w-full">
      <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-5">
        {children}
      </div>
    </div>
  );
}
