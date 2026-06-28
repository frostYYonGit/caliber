/**
 * Records a zero-result lift search (FIX 4). Fire-and-forget from the client;
 * the term is logged to the function's stdout so it shows up in Vercel logs —
 * a zero-infra way to see which lifts to add next (real demand, not guesses).
 * No PII, no body, no storage.
 */
export const config = { runtime: 'edge' };

export default function handler(req: Request): Response {
  const q = new URL(req.url).searchParams.get('q')?.slice(0, 80) ?? '';
  if (q) console.log(`[lift-miss] ${q}`);
  return new Response(null, { status: 204 });
}
