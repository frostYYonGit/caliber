import { useRef, useState, type RefObject } from 'react';
import { toPng } from 'html-to-image';
import type { IronRankResult } from '../lib/result';
import { topPercent } from '../lib/result';
import { challengeLink } from '../lib/share';
import { shareOrigin } from '../config';
import { ARCHETYPES } from '../data/archetypes';
import { trackEvent } from '../lib/analytics';
import { shareEventProps } from '../lib/analytics-result';
import { StoryCard } from './StoryCard';

type Busy = null | 'png' | 'story';

async function nodeToPng(node: HTMLElement, pixelRatio: number): Promise<string> {
  // Fonts must be loaded or the PNG falls back to system fonts (§6.1).
  await document.fonts.ready;
  return toPng(node, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: '#0E0F12',
  });
}

function download(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** The dare text that rides on the challenge link. */
function challengeText(result: IronRankResult): string {
  const arch = result.archetype ? ARCHETYPES[result.archetype.id].name : null;
  const top = cap(topPercent(result.composite.overallPct));
  return arch
    ? `I'm a ${arch}, ${top} on Caliber — think you can beat me?`
    : `${top} on Caliber — think you can beat me?`;
}

/**
 * Share actions, challenge-first. The headline action is "Challenge a friend"
 * (native share sheet with pre-filled dare, or clipboard copy) — the peer loop.
 * Save card / Story stay as secondary. `cardRef` points at whatever the hero
 * card is (solo result, or the head-to-head).
 */
export function ShareActions({
  result,
  cardRef,
  opponent,
}: {
  result: IronRankResult;
  cardRef: RefObject<HTMLDivElement | null>;
  opponent?: IronRankResult | null;
}) {
  const [busy, setBusy] = useState<Busy>(null);
  const [toast, setToast] = useState<string | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const challenge = async () => {
    const url = challengeLink(result, shareOrigin() || window.location.origin, opponent);
    const text = challengeText(result);
    const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
    trackEvent('challenge_clicked', {
      ...shareEventProps(result),
      method: canNativeShare ? 'native' : 'clipboard',
      has_opponent: !!opponent,
    });
    try {
      if (canNativeShare) {
        await navigator.share({ title: 'CALIBER', text, url });
        // No toast needed — the OS sheet is the feedback.
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        flash('Challenge copied — paste it to your crew ✓');
      }
    } catch {
      // User dismissed the share sheet, or clipboard blocked — not an error.
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        flash('Challenge copied ✓');
      } catch {
        /* give up silently */
      }
    }
  };

  const savePng = async () => {
    if (!cardRef.current) return;
    trackEvent('save_card_clicked', { ...shareEventProps(result), has_opponent: !!opponent });
    setBusy('png');
    try {
      const url = await nodeToPng(cardRef.current, 2);
      download(url, opponent ? 'caliber-vs.png' : 'caliber-card.png');
      flash('Saved ✓');
    } catch {
      flash('Export failed — try again');
    } finally {
      setBusy(null);
    }
  };

  const saveStory = async () => {
    if (!storyRef.current) return;
    trackEvent('story_clicked', { ...shareEventProps(result), has_opponent: !!opponent });
    setBusy('story');
    try {
      const url = await nodeToPng(storyRef.current, 1);
      download(url, 'caliber-story.png');
      flash('Story saved ✓');
    } catch {
      flash('Export failed — try again');
    } finally {
      setBusy(null);
    }
  };

  const secondary =
    'flex items-center justify-center gap-1.5 rounded-xl border border-line bg-raised px-3 py-3 text-[14px] font-bold text-text transition-colors hover:border-textmut disabled:opacity-50';

  return (
    <div className="w-full">
      {/* Headline action — challenge a friend (the peer loop) */}
      <button
        onClick={challenge}
        className="flex w-full items-center justify-center rounded-xl bg-accent px-5 text-base font-bold text-[#0E0F12] transition-colors hover:bg-[#ff8a45]"
        style={{ minHeight: 52 }}
      >
        Challenge a friend →
      </button>

      {/* Secondary — save the card / story */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button onClick={savePng} disabled={busy !== null} className={secondary}>
          {busy === 'png' ? '…' : '↓ Save image'}
        </button>
        <button onClick={saveStory} disabled={busy !== null} className={secondary}>
          {busy === 'story' ? '…' : '✦ Story · 9:16'}
        </button>
      </div>

      <div className="h-5 pt-1 text-center">
        {toast && <span className="font-mono text-xs text-accent">{toast}</span>}
      </div>

      {/* Off-screen 1080×1920 node used only for the story export. */}
      <div aria-hidden style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
        <StoryCard ref={storyRef} result={result} opponent={opponent} />
      </div>
    </div>
  );
}
