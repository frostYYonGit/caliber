import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

/* Self-contained: Vercel's Edge bundler won't pull TS modules from ../src, so
 * the few constants this route needs are inlined here (kept in sync with
 * src/data/standards.ts + src/data/archetypes.ts by hand). */

type Tier = 'Untrained' | 'Novice' | 'Intermediate' | 'Advanced' | 'Elite' | 'World Class';
type Population = 'general' | 'gym' | 'serious';

const TIER_COLOR: Record<Tier, string> = {
  Untrained: '#AEB4BF',
  Novice: '#5FB0EC',
  Intermediate: '#E6EAF1',
  Advanced: '#F4B23E',
  Elite: '#FF7A2E',
  'World Class': '#FFD45E',
};

const TIER_VERDICT: Record<Tier, string> = {
  Untrained: 'Everyone starts here. Go pick up the bar.',
  Novice: 'Foundation laid. Now stack the plates.',
  Intermediate: 'Stronger than most people who lift. Keep climbing.',
  Advanced: 'Top 10–30% of lifters. The muscle is earned.',
  Elite: 'Top 2%. Rarefied air up here.',
  'World Class': 'Top 0.1%. Genetically gifted or relentless — either way, a freak.',
};

const ARCH: Record<string, { name: string; tagline: string; color: string }> = {
  prospect: { name: 'Prospect', tagline: 'Nothing but runway.', color: '#5FD08A' },
  powerbuilder: { name: 'Powerbuilder', tagline: 'No weak link.', color: '#8AB4F8' },
  mirror_athlete: { name: 'Mirror Athlete', tagline: 'Built top-down.', color: '#C9B6FF' },
  glass_cannon: { name: 'Glass Cannon', tagline: 'All press. No foundation.', color: '#5FD0E6' },
  the_mule: { name: 'The Mule', tagline: 'Pulls everything. Presses nothing.', color: '#E8A14E' },
  different_breed: { name: 'Different Breed', tagline: 'Strong everywhere. Quietly unfair.', color: '#FFD45E' },
  deadlift_demon: { name: 'Deadlift Demon', tagline: 'The bar bends first.', color: '#FF6B6B' },
  squat_monster: { name: 'Squat Monster', tagline: 'Moves the most weight. Quietly.', color: '#B388FF' },
  bench_boss: { name: 'Bench Boss', tagline: 'Mondays belong to you.', color: '#FF9F45' },
  press_machine: { name: 'Press Machine', tagline: 'Overhead, unbothered.', color: '#4FD1C5' },
};

const SEX_FROM: Record<string, 'male' | 'female'> = { m: 'male', f: 'female' };
const POP_FROM: Record<string, Population> = { gen: 'general', gym: 'gym', ser: 'serious' };

function hexToRgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

async function loadFont(query: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${query}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    }).then((r) => r.text());
    const url = css.match(/src:\s*url\((.+?)\)\s*format/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

function sexPhrase(sex: 'male' | 'female', pop: Population): string {
  if (pop === 'general') return `${sex} adults`;
  if (pop === 'gym') return `${sex} lifters who lift`;
  return `serious ${sex} lifters`;
}

export default async function handler(req: Request) {
  const reqUrl = new URL(req.url);
  const { searchParams } = reqUrl;
  const host = reqUrl.host; // print the live deploy host, never a domain we don't own

  const sex = SEX_FROM[searchParams.get('s') ?? 'm'] ?? 'male';
  const pop = POP_FROM[searchParams.get('p') ?? 'ser'] ?? 'serious';
  const score = Number(searchParams.get('sc')) || 0;
  const tier = (searchParams.get('ti') as Tier) || 'Untrained';
  const pct = Number(searchParams.get('pc')) || 0;
  const dotsScore = searchParams.get('do');
  const dotsLabel = searchParams.get('dl');
  const tierColor = TIER_COLOR[tier] ?? '#AEB4BF';

  const arId = searchParams.get('ar') ?? '';
  const arch = ARCH[arId] ?? null;
  const color = arch ? arch.color : tierColor; // theme to the archetype

  const [display, body, mono] = await Promise.all([
    loadFont('Archivo:wght@800'),
    loadFont('Space+Grotesk:wght@500'),
    loadFont('Space+Mono:wght@700'),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500 | 700 | 800 }[] = [];
  if (display) fonts.push({ name: 'Archivo', data: display, weight: 800 });
  if (body) fonts.push({ name: 'Space Grotesk', data: body, weight: 500 });
  if (mono) fonts.push({ name: 'Space Mono', data: mono, weight: 700 });

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background:
            'radial-gradient(900px 500px at 30% -10%, ' +
            hexToRgba(color, 0.18) +
            ', transparent 60%), linear-gradient(160deg, #181A1F, #0E0F12)',
          fontFamily: 'Space Grotesk',
          color: '#F5F6F8',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Archivo', fontSize: 40, fontWeight: 800 }}>
            CALIBER<span style={{ color: '#FF7A2E' }}>.</span>
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Space Mono',
              fontSize: 22,
              padding: '8px 18px',
              borderRadius: 999,
              color: tierColor,
              border: `2px solid ${hexToRgba(tierColor, 0.5)}`,
              background: hexToRgba(tierColor, 0.12),
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            ★ {tier}
          </div>
        </div>

        {/* Identity (archetype) leads; score is a supporting stat */}
        {arch ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 96, lineHeight: 0.95, color, textTransform: 'uppercase', letterSpacing: -3 }}>
              {arch.name}
            </div>
            <div style={{ fontSize: 38, color: '#C2C8D2', marginTop: 12 }}>{arch.tagline}</div>
            <div style={{ display: 'flex', fontFamily: 'Space Mono', fontSize: 24, color: '#9CA3AE', marginTop: 16, letterSpacing: 2 }}>
              STRENGTH SCORE {score} · {tier.toUpperCase()}
              {dotsScore ? ` · DOTS ${dotsScore}` : ''}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28 }}>
            <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 240, lineHeight: 0.9, color, letterSpacing: -8 }}>
              {score}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 30 }}>
              <div style={{ fontFamily: 'Space Mono', fontSize: 22, color: '#9CA3AE', textTransform: 'uppercase', letterSpacing: 3 }}>
                Strength Score / 1000
              </div>
              <div style={{ fontSize: 30, color: '#C2C8D2', marginTop: 8, maxWidth: 560 }}>
                {TIER_VERDICT[tier]}
              </div>
            </div>
          </div>
        )}

        {/* Footer line — percentile hook + the invitation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 30 }}>
              Stronger than <span style={{ color, fontWeight: 700 }}>{pct}%</span> of{' '}
              {sexPhrase(sex, pop)}
            </div>
            {dotsScore && (
              <div style={{ fontFamily: 'Space Mono', fontSize: 22, color: '#9CA3AE', marginTop: 6 }}>
                DOTS {dotsScore} · {dotsLabel}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', fontFamily: 'Archivo', fontWeight: 800, fontSize: 30, color: '#FF7A2E' }}>
            What's your Caliber? → {host}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: fonts.length ? fonts : undefined },
  );
}
