/**
 * Edge function for /r result links. Humans get the SPA shell (which reads the
 * query params and renders the card); crawlers get per-result og/twitter meta
 * so a shared result unfurls with personalized title + description.
 *
 * (No dynamic preview image: @vercel/og isn't supported in Edge Functions on a
 * non-Next project, so we keep text unfurls and skip the generated card image.)
 */
export const config = { runtime: 'edge' };

// id -> display name (kept in sync with src/data/archetypes.ts).
const ARCH_NAME: Record<string, string> = {
  prospect: 'Prospect',
  powerbuilder: 'Powerbuilder',
  mirror_athlete: 'Mirror Athlete',
  glass_cannon: 'Glass Cannon',
  the_mule: 'The Mule',
  different_breed: 'Different Breed',
  deadlift_demon: 'Deadlift Demon',
  squat_monster: 'Squat Monster',
  bench_boss: 'Bench Boss',
  press_machine: 'Press Machine',
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const origin = url.origin;
  const pct = Number(url.searchParams.get('pc'));
  const archName = ARCH_NAME[url.searchParams.get('ar') ?? ''] ?? null;
  const top = Number.isFinite(pct) ? Math.max(0.1, 100 - pct) : null;
  const topLabel = top !== null ? `Top ${top >= 10 ? Math.round(top) : top.toFixed(1)}%` : null;

  // Lead with identity + percentile, not the raw score.
  const title = archName
    ? `${archName}${topLabel ? ` · ${topLabel}` : ''} — CALIBER`
    : topLabel
      ? `${topLabel} lifter — CALIBER`
      : 'CALIBER — What kind of lifter are you?';
  const desc = Number.isFinite(pct)
    ? `Stronger than ${pct}% of lifters. Age- & bodyweight-adjusted. What's your Caliber?`
    : "Find your lifter type and your rank. What's your Caliber?";
  const canonical = `https://caliberlifts.app/r${url.search}`;

  // Pull the built SPA shell and swap in per-result social meta.
  let html = await fetch(`${origin}/index.html`).then((r) => r.text());
  html = html
    .replace(/\s*<meta property="og:[^>]*>/g, '')
    .replace(/\s*<meta name="twitter:[^>]*>/g, '');

  const meta = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="CALIBER" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
  ].join('\n    ');

  html = html.replace('</head>', `    ${meta}\n  </head>`);

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=86400',
    },
  });
}
