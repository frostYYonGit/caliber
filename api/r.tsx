/**
 * Edge function for /r result links. Humans get the SPA shell (which reads the
 * query params and renders the card); crawlers get per-result og/twitter meta
 * so a shared result unfurls with personalized title + description.
 *
 * (No dynamic preview image: @vercel/og isn't supported in Edge Functions on a
 * non-Next project, so we keep text unfurls and skip the generated card image.)
 */
export const config = { runtime: 'edge' };

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const origin = url.origin;
  const sc = url.searchParams.get('sc') ?? '';
  const tier = url.searchParams.get('ti') ?? '';
  const pct = url.searchParams.get('pc') ?? '';

  const title = `CALIBER — Strength Score ${sc}${tier ? ` · ${tier}` : ''}`;
  const desc = pct
    ? `Stronger than ${pct}% of lifters. Age- & bodyweight-adjusted. What's your Caliber?`
    : "Age- & bodyweight-adjusted strength ranking. What's your Caliber?";

  // Pull the built SPA shell and swap in per-result social meta.
  let html = await fetch(`${origin}/index.html`).then((r) => r.text());
  html = html
    .replace(/\s*<meta property="og:[^>]*>/g, '')
    .replace(/\s*<meta name="twitter:[^>]*>/g, '');

  const meta = [
    `<meta property="og:type" content="website" />`,
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
