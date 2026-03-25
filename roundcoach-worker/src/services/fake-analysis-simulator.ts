export interface FakeAnalysisSimulationInput {
  vodId: string;
  matchId: string;
  userId: string;
  map: string;
  agent: string;
  result: 'WIN' | 'LOSS';
  score: string;
}

export interface FakeAnalysisSimulationResult {
  deathsFirst: number;
  entryKills: number;
  crosshairScore: number;
  utilityUsageScore: number;
  positioningScore: number;
}

export function simulateFakeAnalysis(
  input: FakeAnalysisSimulationInput,
): FakeAnalysisSimulationResult {
  const seed = createSeed(
    [
      input.userId,
      input.matchId,
      input.vodId,
      input.map,
      input.agent,
      input.result,
      input.score,
    ].join(':'),
  );
  const random = createRandom(seed);
  const scoreContext = parseScore(input.score, input.result);
  const agentProfile = getAgentProfile(input.agent);
  const mapProfile = getMapProfile(input.map);
  const resultProfile = getResultProfile(input.result, scoreContext.delta);

  const crosshairBase = 61 + random() * 14;
  const utilityBase = 59 + random() * 15;
  const positioningBase = 60 + random() * 14;
  const entryBase = 4 + Math.round(random() * 4);
  const firstDeathBase = 3 + Math.round(random() * 3);

  return {
    deathsFirst: clampInt(
      firstDeathBase +
        agentProfile.deathsFirst +
        mapProfile.deathsFirst +
        resultProfile.deathsFirst,
      1,
      9,
    ),
    entryKills: clampInt(
      entryBase + agentProfile.entry + mapProfile.entry + resultProfile.entry,
      2,
      12,
    ),
    crosshairScore: clampScore(
      crosshairBase +
        agentProfile.crosshair +
        mapProfile.crosshair +
        resultProfile.crosshair,
    ),
    utilityUsageScore: clampScore(
      utilityBase +
        agentProfile.utility +
        mapProfile.utility +
        resultProfile.utility,
    ),
    positioningScore: clampScore(
      positioningBase +
        agentProfile.positioning +
        mapProfile.positioning +
        resultProfile.positioning,
    ),
  };
}

function getAgentProfile(agent: string) {
  const normalized = agent.trim().toLowerCase();
  const profiles: Record<
    string,
    {
      crosshair: number;
      utility: number;
      positioning: number;
      entry: number;
      deathsFirst: number;
    }
  > = {
    jett: { crosshair: 5, utility: -4, positioning: -1, entry: 3, deathsFirst: 1 },
    raze: { crosshair: 3, utility: -1, positioning: -1, entry: 3, deathsFirst: 1 },
    reyna: { crosshair: 6, utility: -6, positioning: -2, entry: 3, deathsFirst: 1 },
    neon: { crosshair: 4, utility: -3, positioning: -2, entry: 4, deathsFirst: 2 },
    phoenix: { crosshair: 3, utility: -1, positioning: -1, entry: 2, deathsFirst: 1 },
    yoru: { crosshair: 4, utility: -2, positioning: -2, entry: 2, deathsFirst: 2 },
    sova: { crosshair: 0, utility: 5, positioning: 1, entry: 1, deathsFirst: 0 },
    fade: { crosshair: 0, utility: 4, positioning: 1, entry: 1, deathsFirst: 0 },
    gekko: { crosshair: 0, utility: 5, positioning: 1, entry: 1, deathsFirst: 0 },
    breach: { crosshair: -1, utility: 6, positioning: 0, entry: 1, deathsFirst: 0 },
    kayo: { crosshair: 2, utility: 4, positioning: 0, entry: 2, deathsFirst: 0 },
    skye: { crosshair: 0, utility: 5, positioning: 1, entry: 1, deathsFirst: 0 },
    omen: { crosshair: 0, utility: 5, positioning: 4, entry: -1, deathsFirst: -1 },
    brimstone: { crosshair: -1, utility: 5, positioning: 3, entry: -1, deathsFirst: -1 },
    astra: { crosshair: -1, utility: 6, positioning: 4, entry: -2, deathsFirst: -1 },
    viper: { crosshair: 0, utility: 6, positioning: 4, entry: -1, deathsFirst: -1 },
    harbor: { crosshair: -1, utility: 5, positioning: 3, entry: 0, deathsFirst: -1 },
    cypher: { crosshair: 0, utility: 4, positioning: 5, entry: -2, deathsFirst: -2 },
    killjoy: { crosshair: 0, utility: 4, positioning: 5, entry: -2, deathsFirst: -2 },
    sage: { crosshair: -1, utility: 4, positioning: 4, entry: -2, deathsFirst: -1 },
    chamber: { crosshair: 4, utility: 1, positioning: 4, entry: -1, deathsFirst: -1 },
    deadlock: { crosshair: -1, utility: 4, positioning: 4, entry: -2, deathsFirst: -1 },
    vyse: { crosshair: 0, utility: 4, positioning: 4, entry: -1, deathsFirst: -1 },
  };

  return (
    profiles[normalized] ?? {
      crosshair: 0,
      utility: 0,
      positioning: 0,
      entry: 0,
      deathsFirst: 0,
    }
  );
}

function getMapProfile(map: string) {
  const normalized = map.trim().toLowerCase();
  const profiles: Record<
    string,
    {
      crosshair: number;
      utility: number;
      positioning: number;
      entry: number;
      deathsFirst: number;
    }
  > = {
    ascent: { crosshair: 2, utility: 1, positioning: 1, entry: 0, deathsFirst: 0 },
    bind: { crosshair: 0, utility: 3, positioning: 1, entry: 0, deathsFirst: 0 },
    haven: { crosshair: 1, utility: 2, positioning: 0, entry: 1, deathsFirst: 0 },
    split: { crosshair: 1, utility: 1, positioning: 3, entry: -1, deathsFirst: -1 },
    lotus: { crosshair: 0, utility: 3, positioning: 2, entry: 1, deathsFirst: 0 },
    sunset: { crosshair: 1, utility: 1, positioning: 3, entry: 0, deathsFirst: -1 },
    icebox: { crosshair: 3, utility: 0, positioning: 0, entry: 1, deathsFirst: 1 },
    pearl: { crosshair: 2, utility: 1, positioning: 1, entry: 1, deathsFirst: 0 },
    fracture: { crosshair: 0, utility: 2, positioning: 0, entry: 2, deathsFirst: 1 },
    breeze: { crosshair: 3, utility: 0, positioning: 1, entry: 1, deathsFirst: 1 },
    abyss: { crosshair: 1, utility: 2, positioning: 2, entry: 1, deathsFirst: 0 },
  };

  return (
    profiles[normalized] ?? {
      crosshair: 0,
      utility: 0,
      positioning: 0,
      entry: 0,
      deathsFirst: 0,
    }
  );
}

function getResultProfile(result: 'WIN' | 'LOSS', delta: number) {
  const clampedDelta = Math.max(-10, Math.min(10, delta));
  const winBias = result === 'WIN' ? 1 : -1;

  return {
    crosshair: winBias * (2 + clampedDelta * 0.2),
    utility: winBias * (1 + clampedDelta * 0.15),
    positioning: winBias * (2 + clampedDelta * 0.2),
    entry: Math.round(winBias * (1 + clampedDelta * 0.12)),
    deathsFirst: Math.round(-winBias * (1 + clampedDelta * 0.08)),
  };
}

function parseScore(score: string, result: 'WIN' | 'LOSS') {
  const matched = score.match(/(\d+)\s*-\s*(\d+)/);

  if (!matched) {
    return {
      own: result === 'WIN' ? 13 : 9,
      enemy: result === 'WIN' ? 9 : 13,
      delta: result === 'WIN' ? 4 : -4,
    };
  }

  const left = Number(matched[1]);
  const right = Number(matched[2]);
  const own = result === 'WIN' ? Math.max(left, right) : Math.min(left, right);
  const enemy = result === 'WIN' ? Math.min(left, right) : Math.max(left, right);

  return { own, enemy, delta: own - enemy };
}

function createSeed(value: string): number {
  return value.split('').reduce((accumulator, char) => {
    return (accumulator * 31 + char.charCodeAt(0)) % 2147483647;
  }, 17);
}

function createRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

function clampScore(value: number) {
  return Number(Math.max(35, Math.min(95, value)).toFixed(1));
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
