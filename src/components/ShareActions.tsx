import { useRef, useState, type RefObject } from 'react';
import { toPng } from 'html-to-image';
import type { IronRankResult } from '../lib/result';
import { resultUrl } from '../lib/share';
import { StoryCard } from './StoryCard';

type Busy = null | 'png' | 'link' | 'story';

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

export function ShareActions({
  result,
  cardRef,
}: {
  result: IronRankResult;
  cardRef: RefObject<HTMLDivElement | null>;
}) {
  const [busy, setBusy] = useState<Busy>(null);
  const [toast, setToast] = useState<string | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const savePng = async () => {
    if (!cardRef.current) return;
    setBusy('png');
    try {
      const url = await nodeToPng(cardRef.current, 2);
      download(url, 'caliber-card.png');
      flash('Card saved ✓');
    } catch {
      flash('Export failed — try again');
    } finally {
      setBusy(null);
    }
  };

  const saveStory = async () => {
    if (!storyRef.current) return;
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

  const copyLink = async () => {
    setBusy('link');
    try {
      const url = resultUrl(result, window.location.origin);
      await navigator.clipboard.writeText(url);
      flash('Link copied ✓');
    } catch {
      flash('Copy failed');
    } finally {
      setBusy(null);
    }
  };

  const btn =
    'flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors disabled:opacity-50';

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={savePng}
          disabled={busy !== null}
          className={`${btn} border-accent bg-accent text-[#0E0F12] hover:bg-[#ff8a45]`}
        >
          {busy === 'png' ? '…' : '↓ Save card'}
        </button>
        <button
          onClick={copyLink}
          disabled={busy !== null}
          className={`${btn} border-line bg-raised text-text hover:border-textmut`}
        >
          {busy === 'link' ? '…' : '🔗 Copy link'}
        </button>
        <button
          onClick={saveStory}
          disabled={busy !== null}
          className={`${btn} border-line bg-raised text-text hover:border-textmut`}
        >
          {busy === 'story' ? '…' : '✦ Story'}
        </button>
      </div>

      <div className="h-5 pt-1 text-center">
        {toast && <span className="font-mono text-xs text-accent">{toast}</span>}
      </div>

      {/* Off-screen 1080×1920 node used only for the story export. */}
      <div
        aria-hidden
        style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}
      >
        <StoryCard ref={storyRef} result={result} />
      </div>
    </div>
  );
}
