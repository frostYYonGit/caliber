import { useEffect, useState, type ReactNode } from 'react';
import { APP_NAME, HANDLE, shareHost } from '../config';
import { trackEvent } from '../lib/analytics';
import { Shell } from '../components/Shell';
import { LandingCard } from '../components/LandingCard';

/**
 * The landing route — the one screen ~95% of TikTok traffic bounces from. Its
 * ONLY job is to raise the start rate (homepage_view → clicked_find_your_type).
 *
 * It is deliberately lightweight: no funnel, no scoring engine, no
 * html-to-image, no eager PostHog. Those load only when the visitor taps
 * "Find my type" (App lazy-loads the quiz chunk then). Everything here serves
 * one action: a single, repeated, thumb-zone CTA.
 */

const HEADLINES = {
  default: 'What kind of lifter are you?',
  bench: 'Strong — or just good at bench?',
  findout: 'Find out what kind of lifter you actually are.',
} as const;

/** Message match: continue the TikTok hook. Swap headline by UTM, else default. */
function resolveHeadline(): string {
  try {
    const p = new URLSearchParams(window.location.search);
    const raw = (p.get('utm_campaign') || p.get('utm_content') || '').toLowerCase();
    if (raw.includes('bench')) return HEADLINES.bench;
    if (raw.includes('findout') || raw.includes('actually') || raw.includes('type'))
      return HEADLINES.findout;
  } catch {
    /* default below */
  }
  return HEADLINES.default;
}

type CtaLocation = 'hero' | 'sticky' | 'mid';

export function Landing({ onStart }: { onStart: () => void }) {
  const [headline] = useState(resolveHeadline);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    trackEvent('homepage_view', {
      path: window.location.pathname,
      referrer: document.referrer || undefined,
    });
  }, []);

  // Sticky CTA appears once the visitor scrolls down past the hero. A simple
  // scroll threshold (rAF-throttled) is far more reliable than an observer here:
  // the page is short, so the hero CTA rarely leaves the viewport entirely.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setShowSticky(window.scrollY > 220);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const start = (cta_location: CtaLocation) => {
    trackEvent('clicked_find_your_type', { path: window.location.pathname, cta_location });
    onStart();
  };

  return (
    <>
      <Shell>
        {/* Top bar — wordmark only, no nav competing with the CTA */}
        <header className="flex items-center pt-3 pb-1">
          <p className="font-display text-lg font-black tracking-tight text-text">
            {APP_NAME}
            <span className="text-accent">.</span>
          </p>
        </header>

        {/* ── Above the fold ── */}
        <section className="flex flex-col">
          <h1
            className="font-display mt-4 font-black tracking-[-0.03em] text-text"
            style={{ fontSize: 'clamp(2.1rem, 9.5vw, 2.55rem)', lineHeight: 1.02 }}
          >
            {headline}
          </h1>
          <p className="mt-2.5 text-[16px] leading-snug text-text2">
            Enter your lifts. Get your <span className="text-text">type</span>, your rank, and the
            card to prove it.
          </p>

          <div className="mt-4">
            <LandingCard />
          </div>

          <p className="mt-3 text-center text-[17px] font-bold text-text">
            11 lifter types. <span className="text-accent">You're one of them.</span>
          </p>

          <div className="mt-3">
            <CtaButton onClick={() => start('hero')}>Find my type →</CtaButton>
          </div>
          <p className="mt-2 text-center text-[13px] text-text2">Free · No signup · 60 seconds</p>
        </section>

        {/* ── Below the fold (kept short) ── */}
        <section className="mt-12 flex flex-col gap-7 pb-10">
          <div className="flex flex-col gap-2.5">
            <Step n="1" label="Enter your lifts" />
            <Step n="2" label="Get your type + rank" />
            <Step n="3" label="Post your card" />
          </div>

          <p className="font-mono text-center text-[11px] leading-relaxed text-textmut">
            Real standards · Epley 1RM · age &amp; bodyweight adjusted · DOTS
          </p>

          <CtaButton onClick={() => start('mid')}>Find my type →</CtaButton>

          <footer className="flex flex-col items-center gap-1 pt-2">
            <p className="font-display text-sm font-black tracking-tight text-textmut">
              {APP_NAME}
              <span className="text-accent">.</span>
            </p>
            <p className="font-mono text-[11px] text-textmut">
              {shareHost()} · {HANDLE}
            </p>
          </footer>
        </section>
      </Shell>

      {/* Sticky thumb-zone CTA — always one tap away on scroll */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line transition-transform duration-300"
        style={{
          transform: showSticky ? 'translateY(0)' : 'translateY(110%)',
          background: 'rgba(14,15,18,0.92)',
          backdropFilter: 'blur(10px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          paddingTop: 12,
        }}
      >
        <div className="mx-auto w-full max-w-[440px] px-5">
          <CtaButton onClick={() => start('sticky')}>Find my type →</CtaButton>
        </div>
      </div>
    </>
  );
}

function CtaButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-display flex w-full items-center justify-center rounded-xl bg-accent px-5 text-[17px] font-black tracking-tight text-[#0E0F12] transition-colors hover:bg-[#ff8a45]"
      style={{ minHeight: 56 }}
    >
      {children}
    </button>
  );
}

function Step({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/40 text-[13px] font-bold text-accent">
        {n}
      </span>
      <span className="text-[15px] text-text">{label}</span>
    </div>
  );
}
