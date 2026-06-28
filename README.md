# CALIBER

A credible, age- and bodyweight-adjusted strength ranking, rendered as a
premium, screenshot-ready share card. Enter your stats and lifts; get one
composite **Strength Score (0–1000)**, a tier, a percentile vs a chosen
comparison population, a **DOTS** relative-strength score, and a per-lift
breakdown.

Built per the CALIBER build spec. Single-page, client-only, no backend, no
auth, no trackers — plus one serverless route for dynamic link-preview images.

## Stack

- **Vite + React + TypeScript + Tailwind CSS v4**
- **html-to-image** for client-side PNG / Story export
- **@vercel/og** for the dynamic Open Graph share image
- Scoring is a pure, unit-tested module: [`src/lib/scoring.ts`](src/lib/scoring.ts)

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 (or the port Vite picks)
npm test           # scoring unit tests (the "realness" proof)
npm run build      # tsc -b && vite build  ->  dist/
```

## The scoring engine (real methodology)

All internal math is in **kg** (`kg = lb / 2.2046226`). Pipeline per lift:

1. **Estimated 1RM — Epley.** `oneRM = reps<=1 ? w : w*(1+reps/30)`.
2. **Bodyweight ratio.** `ratio = oneRM / bodyweight`.
3. **Age adjustment.** `adjustedRatio = ratio / ageCoeff(age)`, where the
   coefficient is the fraction of peak strength typical at that age
   (interpolated, clamped to 13–80). A strong 16-year-old ranks like the
   peak-age lifter they'd become — not "Untrained."
4. **Population scaling.** Thresholds are multiplied by the chosen population
   factor (serious `1.00`, gym `0.85`, general `0.62`). A lower threshold means
   the same lift earns a higher percentile.
5. **Percentile → tier.** Piecewise-linear bands map the adjusted ratio to a
   percentile (`Untrained → World Class`).

Reps are capped at **12** — Epley loses accuracy on higher-rep sets, so the
stepper won't let you enter a number that would produce a fake-inflated 1RM.

**Composite Strength Score** = weighted mean of *scored* lift percentiles (the
big three count full, accessories half) × 10, capped at 1000.

**DOTS** (computed only when Back Squat + Bench + Deadlift are all entered) uses
the official IPF coefficients:
`DOTS = total_kg * 500 / (a + b·BW + c·BW² + d·BW³ + e·BW⁴)`.

> Note: the spec's §9 estimate of "≈330" for a 90 kg male totalling 500 kg is an
> approximation; the authoritative IPF formula yields **323.3**, which matches
> public DOTS calculators within ±1. The test asserts the formula's real output.

**Curated lift library.** Exactly 11 lifts, every one with real standards (no
made-up numbers): the big four preloaded + 7 addable, grouped **Upper / Lower**.
Each lift carries a `group` (upper/lower) that powers both the Add menu and the
Lifter Type axes. The data model still supports `tracked, not scored` lifts for
future additions; in v1 all 11 are scored.

See [`src/data/standards.ts`](src/data/standards.ts) for every constant.

## Lifter Types (the headline)

The card leads with an **archetype**, not the score — identity is the more viral
hook. [`src/lib/classify.ts`](src/lib/classify.ts) is a pure, unit-tested
classifier over two axes — UPPER vs LOWER and BALANCED vs PEAKED — resolving (in
order) to one of 10 types: Specialist (Deadlift Demon / Squat Monster / Bench
Boss / Press Machine) → Different Breed → Prospect → Glass Cannon → Mirror
Athlete → The Mule → Powerbuilder. A full type needs ≥1 upper **and** ≥1 lower
lift; otherwise the card shows the score plus a teaser to enter both.

Roster copy, colors, rarity, rivals and icons live in
[`src/data/archetypes.ts`](src/data/archetypes.ts) (an editorial draft — tune
freely). The result reveals in two beats: the archetype name slot-rolls and
slams in, then the score counts up and the bars fill (skipped under
`prefers-reduced-motion`). The resolved archetype id rides in the `/r?…&ar=` param
so shared links and the OG image render the same typed card.

**Best-lift spotlight** still applies on the teaser/score path: it surfaces the
user's highest-percentile lift so a mixed lifter always has an honest flex.

## Share & distribution

- **Save card (PNG):** awaits `document.fonts.ready`, renders at 2× on an
  explicit dark background. The score glow is a CSS radial-gradient (not
  box-shadow) so the saved PNG matches the screen.
- **Shareable link:** the finished result is encoded into `/r?…` query params
  (weights stored in kg for lossless reconstruction). Loading such a URL skips
  onboarding and renders the card directly.
- **Story export (1080×1920):** a "Story" variant for TikTok/IG.
- **Dynamic OG image:** [`api/og.tsx`](api/og.tsx) renders the card as the
  link-preview image. [`api/r.tsx`](api/r.tsx) serves `/r` with per-result
  `og:`/`twitter:` meta so links unfurl as the card on X / iMessage / Discord.
- **Challenge hook:** every card and OG image ends with `What's your Caliber? →
  <host>`, turning a screenshot into a findable invitation that recruits new
  users — the loop closing, not just the payoff.

Set the app name, handle, and canonical domain in [`src/config.ts`](src/config.ts).
`CANONICAL_ORIGIN` is set to `https://caliberlifts.app`, so every card and copied
link prints `caliberlifts.app` (it falls back to the live deploy origin only if
ever unset).

## Onboarding (4 steps, value-first)

An intro screen, then four screens — **Sex + Units → Age + Bodyweight → Lifts →
Compare against**. No experience step (folded into a `gym` default) and no height
step; the depth lives in the math, not the click count, so more cold visitors
finish a card.

## Deploying to Vercel

This project lives in the `ironrank/` subdirectory of the repo. When importing
to Vercel, **set the project's _Root Directory_ to `ironrank`**. Vercel will:

- build the SPA with `npm run build` → `dist/`
- deploy `api/og.tsx` and `api/r.tsx` as Edge Functions
- apply [`vercel.json`](vercel.json), which rewrites `/r` → `/api/r`

The OG/meta routes require the Vercel runtime, so they're inert under local
`vite dev` (where `/r` is served by the SPA fallback and still works for humans).

### Netlify

[`public/_redirects`](public/_redirects) ships a SPA fallback so result links
(`/r?…`) resolve on Netlify too. Note: `api/og.tsx` and `api/r.tsx` are Vercel
Edge Functions — on Netlify the app, cards, PNG export and share links all work,
but dynamic link-preview *images* would need a Netlify Function equivalent.

## Accessibility

WCAG AA contrast throughout (no body text below `#9CA3AE` on dark), visible
keyboard focus rings, `inputmode="decimal"` on numeric fields, and full
`prefers-reduced-motion` support (count-up, scramble, and bar fills collapse to
final states).
```
