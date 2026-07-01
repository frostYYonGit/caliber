/**
 * CALIBER Lifter Types (Edit 2). The archetype is the headline of the card —
 * identity first, score second.
 *
 * Axes: UPPER vs LOWER (which group leads) × BALANCED vs PEAKED (how big the gap).
 * Taglines are the premium set from the changeset §3. Voice: short, declarative,
 * cold confidence — no setups, no punchlines, no emoji. Colors are tuned to pass
 * AA on --surface; icons are basic geometric glyphs (shape encodes the axis,
 * color carries the identity) so they render everywhere.
 *
 * Rarity %, thresholds, colors and icons here are an editorial draft (no
 * companion file existed) — tune freely.
 *
 * NO TYPE IS A LOSER. Every archetype must read as fun, cool, or aspirational —
 * something a person would happily claim and post. The imbalanced ones (Glass
 * Cannon, The Mule) are self-aware jokes, never mean; Prospect (the low-end
 * result most beginners get) is framed as pure upside, never "you're weak."
 * The identity is generous; the underlying numbers stay honest.
 */

export type ArchetypeId =
  | 'prospect'
  | 'powerbuilder'
  | 'mirror_athlete'
  | 'glass_cannon'
  | 'the_mule'
  | 'different_breed'
  | 'deadlift_demon'
  | 'squat_monster'
  | 'bench_boss'
  | 'press_machine';

export interface Archetype {
  id: ArchetypeId;
  name: string;
  /** Static axis label for the telemetry line (Prospect appends its lean). */
  telemetry: string;
  tagline: string;
  description: string;
  flex: string;
  flaw: string;
  rarity: string;
  rival: ArchetypeId;
  color: string;
  glow: number;
  icon: string;
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  prospect: {
    id: 'prospect',
    name: 'Prospect',
    telemetry: 'EARLY',
    tagline: 'Nothing but runway.',
    description:
      'Every strong lifter on this list started exactly here. What sets a Prospect apart isn’t the number today — it’s how much road is left, and you’ve got more of it than anyone. The foundation is being poured. The next year is the fun part.',
    flex: 'More upside than anyone in the room.',
    flaw: 'No PRs to brag about — yet.',
    rarity: 'Roughly 40% of lifters start right here.',
    rival: 'different_breed',
    color: '#5FD08A',
    glow: 0.4,
    icon: '◇',
  },
  powerbuilder: {
    id: 'powerbuilder',
    name: 'Powerbuilder',
    telemetry: 'BALANCED',
    tagline: 'No weak link.',
    description:
      "No glaring weakness, no inflated strength. Every lift was built in lockstep, and the balance is its own rare thing. Most people peak somewhere and stall — you just climb.",
    flex: 'Every lift pulls its weight.',
    flaw: 'Nothing loud enough to make people stare.',
    rarity: 'Only 14% of lifters are Powerbuilders.',
    rival: 'glass_cannon',
    color: '#8AB4F8',
    glow: 0.42,
    icon: '◆',
  },
  mirror_athlete: {
    id: 'mirror_athlete',
    name: 'Mirror Athlete',
    telemetry: 'UPPER-LEAN',
    tagline: 'Built top-down.',
    description:
      'Your upper body leads and your lower body follows close behind. Press and pull are ahead; the legs are catching up. Close the gap and you change categories.',
    flex: 'Presses that photograph well.',
    flaw: 'Your squat knows the truth.',
    rarity: 'Only 12% of lifters are Mirror Athletes.',
    rival: 'the_mule',
    color: '#C9B6FF',
    glow: 0.44,
    icon: '▲',
  },
  glass_cannon: {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    telemetry: 'UPPER-PEAKED',
    tagline: 'All press. No foundation.',
    description:
      'The upper body is genuinely impressive and the legs are an afterthought. Loud off the chest, quiet under the bar. The cannon is real — it just has no carriage.',
    flex: 'An upper body that ends arguments.',
    flaw: "Skipping legs isn't a personality.",
    rarity: 'Only 6% of lifters are Glass Cannons.',
    rival: 'the_mule',
    color: '#5FD0E6',
    glow: 0.5,
    icon: '▲',
  },
  the_mule: {
    id: 'the_mule',
    name: 'The Mule',
    telemetry: 'LOWER-PEAKED',
    tagline: 'Pulls everything. Presses nothing.',
    description:
      'You pull everything and press nothing. The posterior chain is a machine; the bench is a formality. Unstoppable from the floor, forgettable overhead.',
    flex: "A deadlift that doesn't care how heavy.",
    flaw: 'Overhead, you disappear.',
    rarity: 'Only 7% of lifters are Mules.',
    rival: 'glass_cannon',
    color: '#E8A14E',
    glow: 0.5,
    icon: '▼',
  },
  different_breed: {
    id: 'different_breed',
    name: 'Different Breed',
    telemetry: 'BALANCED · ELITE',
    tagline: 'Strong everywhere. Quietly unfair.',
    description:
      'Strong everywhere, weak nowhere. Press, pull, squat — all elite, none of it luck. This is the rarest outcome in the system, and it never happens by accident.',
    flex: 'No angle of attack works.',
    flaw: 'Nothing left to fix is its own problem.',
    rarity: 'Only 1% of lifters are a Different Breed.',
    rival: 'powerbuilder',
    color: '#FFD45E',
    glow: 0.62,
    icon: '★',
  },
  deadlift_demon: {
    id: 'deadlift_demon',
    name: 'Deadlift Demon',
    telemetry: 'DEADLIFT-PEAKED',
    tagline: 'The bar bends first.',
    description:
      'One lift towers over the rest, and it is the one that matters most. The bar bends before you do. Whatever else you skip, the pull is a weapon.',
    flex: 'A deadlift in a tier of its own.',
    flaw: 'The rest is just bodyguards.',
    rarity: 'Only 5% of lifters are Deadlift Demons.',
    rival: 'bench_boss',
    color: '#FF6B6B',
    glow: 0.54,
    icon: '▼',
  },
  squat_monster: {
    id: 'squat_monster',
    name: 'Squat Monster',
    telemetry: 'SQUAT-PEAKED',
    tagline: 'Moves the most weight. Quietly.',
    description:
      'You move the most weight in the room and rarely mention it. The squat is a freak outlier; everything else is supporting cast. Brutally strong from the bottom.',
    flex: 'A squat that warps the bar.',
    flaw: 'Your upper body is a rumor.',
    rarity: 'Only 5% of lifters are Squat Monsters.',
    rival: 'press_machine',
    color: '#B388FF',
    glow: 0.54,
    icon: '▼',
  },
  bench_boss: {
    id: 'bench_boss',
    name: 'Bench Boss',
    telemetry: 'BENCH-PEAKED',
    tagline: 'Mondays belong to you.',
    description:
      'The bench is yours and everyone knows it. One lift sits far above the rest — and it is the one people ask about first. Mondays belong to you.',
    flex: 'A bench that opens doors.',
    flaw: 'Leg day remains theoretical.',
    rarity: 'Only 6% of lifters are Bench Bosses.',
    rival: 'deadlift_demon',
    color: '#FF9F45',
    glow: 0.52,
    icon: '▲',
  },
  press_machine: {
    id: 'press_machine',
    name: 'Press Machine',
    telemetry: 'PRESS-PEAKED',
    tagline: 'Overhead, unbothered.',
    description:
      'Overhead, unbothered. The strict press is your standout — the hardest upper lift to fake, and you made it a specialty. Shoulders like a hydraulic.',
    flex: "An overhead press that shouldn't be legal.",
    flaw: 'Everything below the shoulders is negotiable.',
    rarity: 'Only 4% of lifters are Press Machines.',
    rival: 'squat_monster',
    color: '#4FD1C5',
    glow: 0.52,
    icon: '▲',
  },
};

/** Order used for the landing-page teaser chips (rare/standout first). */
export const ARCHETYPE_SHOWCASE: ArchetypeId[] = [
  'glass_cannon',
  'the_mule',
  'different_breed',
  'deadlift_demon',
  'powerbuilder',
  'mirror_athlete',
  'squat_monster',
  'bench_boss',
  'press_machine',
  'prospect',
];

export const getArchetype = (id: ArchetypeId): Archetype => ARCHETYPES[id];
