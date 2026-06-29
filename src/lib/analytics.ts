/**
 * Funnel instrumentation. Every event goes through trackEvent() so the backend
 * can be swapped. Currently sends to Vercel Web Analytics custom events.
 *
 * Hard rule: analytics must NEVER break the product — everything is wrapped in
 * try/catch and failures are swallowed. Nothing here blocks navigation or the
 * result. Vercel event property values must be scalars (string/number/boolean),
 * so arrays are joined and objects dropped before sending.
 *
 * Debug: append ?debugEvents=true to any URL to console.log every event.
 */
import { track } from '@vercel/analytics';
import posthog from 'posthog-js';
import { ARCHETYPES } from '../data/archetypes';
import { LIFT_BY_ID } from '../data/standards';
import type { IronRankResult } from './result';

let phReady = false;

type Scalar = string | number | boolean;
type Props = Record<string, unknown>;

const SESSION_KEY = 'caliber_session_id';
const ATTR_KEY = 'caliber_attribution';
const DEBUG_KEY = 'caliber_debug_events';

function safeLocal(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function uuid(): string {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Anonymous, persistent session id. No PII, no login. */
function sessionId(): string {
  const ls = safeLocal();
  try {
    if (!ls) return 'no-store';
    let id = ls.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      ls.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'no-store';
  }
}

interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  initial_referrer?: string;
  landing_path?: string;
}

/** First-touch attribution, captured once and reused on every event. */
function attribution(): Attribution {
  const ls = safeLocal();
  try {
    const stored = ls?.getItem(ATTR_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
    const p = new URLSearchParams(window.location.search);
    const attr: Attribution = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const) {
      const v = p.get(k);
      if (v) attr[k] = v;
    }
    if (document.referrer) attr.initial_referrer = document.referrer;
    attr.landing_path = window.location.pathname;
    ls?.setItem(ATTR_KEY, JSON.stringify(attr));
    return attr;
  } catch {
    return {};
  }
}

function debugOn(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('debugEvents') === 'true') {
      window.sessionStorage?.setItem(DEBUG_KEY, '1');
    }
    return window.sessionStorage?.getItem(DEBUG_KEY) === '1';
  } catch {
    return false;
  }
}

function deviceType(): 'mobile' | 'desktop' {
  try {
    return window.innerWidth > 0 && window.innerWidth < 768 ? 'mobile' : 'desktop';
  } catch {
    return 'desktop';
  }
}

/**
 * Initialize PostHog (the funnel tool) from env. No key => stays off (so local
 * dev and any other env without the key just no-op). Call once at app start.
 */
export function initAnalytics(): void {
  try {
    const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
    if (!key || phReady) return;
    posthog.init(key, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: true,
      autocapture: true,
    });
    phReady = true;
    // Attach attribution + session to every PostHog event (incl. autocaptured).
    posthog.register({ ...attribution(), caliber_session_id: sessionId() });
  } catch {
    /* analytics must never break the product */
  }
}

/** The one tracking entry point. Merges base context, sanitizes, never throws. */
export function trackEvent(name: string, props: Props = {}): void {
  try {
    const merged: Props = {
      ...attribution(),
      session_id: sessionId(),
      device_type: deviceType(),
      ...props,
    };
    const clean: Record<string, Scalar> = {};
    for (const [k, v] of Object.entries(merged)) {
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v)) clean[k] = v.map(String).join(', ');
      else if (typeof v === 'object') continue;
      else clean[k] = v as Scalar;
    }
    if (debugOn()) console.log('[caliber-event]', name, clean);
    try {
      if (phReady) posthog.capture(name, clean);
    } catch {
      /* ignore */
    }
    try {
      track(name, clean);
    } catch {
      /* ignore */
    }
  } catch {
    /* analytics must never break the product */
  }
}

/** Fire an event at most once per session (for first_lift_entered). */
export function trackEventOnce(onceKey: string, name: string, props: Props = {}): void {
  try {
    const k = `caliber_once_${onceKey}`;
    if (window.sessionStorage?.getItem(k)) return;
    window.sessionStorage?.setItem(k, '1');
  } catch {
    /* if storage fails, fall through and just track */
  }
  trackEvent(name, props);
}

/** Shared property bag for the result/share events, derived from the result. */
export function resultEventProps(result: IronRankResult): Props {
  try {
    const { composite, input, lifts, bestLift, archetype } = result;
    const byPct = [...lifts].sort((a, b) => a.percentile - b.percentile);
    const weakest = byPct[0];
    const entered = new Set(input.entries.map((e) => e.id));
    return {
      archetype: archetype ? ARCHETYPES[archetype.id].name : 'none',
      strength_score: composite.strengthScore,
      percentile: Math.round(composite.overallPct),
      tier: composite.overallTier,
      sex: input.sex,
      age: input.age,
      bodyweight: Math.round(input.bodyweightKg),
      units: input.unit,
      comparison_population: input.population,
      valid_lift_count: lifts.length,
      entered_lifts: lifts.map((l) => LIFT_BY_ID[l.id]?.name ?? l.id),
      top_lift: bestLift ? (LIFT_BY_ID[bestLift.id]?.name ?? bestLift.id) : null,
      weakest_lift: weakest ? (LIFT_BY_ID[weakest.id]?.name ?? weakest.id) : null,
      has_squat: entered.has('back_squat'),
      has_bench: entered.has('bench_press'),
      has_deadlift: entered.has('deadlift'),
    };
  } catch {
    return {};
  }
}

/** The 4 core fields for share/save events. */
export function shareEventProps(result: IronRankResult): Props {
  try {
    const { composite, archetype } = result;
    return {
      archetype: archetype ? ARCHETYPES[archetype.id].name : 'none',
      strength_score: composite.strengthScore,
      percentile: Math.round(composite.overallPct),
      tier: composite.overallTier,
    };
  } catch {
    return {};
  }
}
