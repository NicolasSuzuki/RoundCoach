import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const roundCoachUrl = args.api ?? 'http://localhost:3000/api/v1';
const token = args.token ?? process.env.ROUNDCOACH_TOKEN ?? process.env.npm_config_token;
const limit = readPositiveInteger(
  args.limit,
  process.env.npm_config_limit,
  args._[0],
  5,
);
const shardOverride = args.shard ?? process.env.npm_config_shard;
const regionOverride = args.region ?? process.env.npm_config_region;
const clientVersionOverride =
  args['client-version'] ?? process.env.VALORANT_CLIENT_VERSION ?? process.env.npm_config_client_version;
const debug = Boolean(args.debug ?? process.env.npm_config_debug);
const queue = String(args.queue ?? process.env.npm_config_queue ?? 'competitive').toLowerCase();

if (!token) {
  exitWithUsage('Missing RoundCoach JWT. Pass --token=... or set ROUNDCOACH_TOKEN.');
}

const lockfile = await readLockfile(args.lockfile);
const localAuth = `Basic ${Buffer.from(`riot:${lockfile.password}`).toString('base64')}`;
const localBaseUrl = `https://127.0.0.1:${lockfile.port}`;

const entitlements = await requestJson(`${localBaseUrl}/entitlements/v1/token`, {
  headers: { Authorization: localAuth },
  rejectUnauthorized: false,
});
const chatSession = await requestJson(`${localBaseUrl}/chat/v1/session`, {
  headers: { Authorization: localAuth },
  rejectUnauthorized: false,
});
const accountAlias = await requestJson(`${localBaseUrl}/player-account/aliases/v1/active`, {
  headers: { Authorization: localAuth },
  rejectUnauthorized: false,
});
const regionLocale = await requestJson(`${localBaseUrl}/riotclient/region-locale`, {
  headers: { Authorization: localAuth },
  rejectUnauthorized: false,
});
const sessions = await requestJson(`${localBaseUrl}/product-session/v1/external-sessions`, {
  headers: { Authorization: localAuth },
  rejectUnauthorized: false,
});

const puuid = firstString(
  chatSession.puuid,
  chatSession.puuid?.toLowerCase?.(),
  chatSession.game_puuid,
);

if (!puuid) {
  throw new Error('Could not resolve PUUID from local Riot Client chat session.');
}

const region = regionOverride ?? firstString(regionLocale.region, regionLocale.web_region) ?? 'br';
const shard = shardOverride ?? inferShard(region);
const clientVersion =
  clientVersionOverride ??
  (await fetchValorantClientVersion()) ??
  resolveClientVersion(sessions);
const riotHeaders = buildRiotHeaders(entitlements, clientVersion);

const content = await requestJson(`https://shared.${shard}.a.pvp.net/content-service/v3/content`, {
  headers: riotHeaders,
});
const dictionaries = mergeDictionaries(
  buildContentDictionaries(content),
  await fetchPublicValorantDictionaries(),
);
const history = await requestJson(
  `https://pd.${shard}.a.pvp.net/match-history/v1/history/${puuid}`,
  { headers: riotHeaders },
);

const historyItems = history.History ?? history.history ?? [];
const filteredHistoryItems =
  queue === 'all'
    ? historyItems
    : historyItems.filter((item) => {
        return String(item.QueueID ?? item.queueId ?? item.queueID ?? '').toLowerCase() === queue;
      });

if (debug) {
  console.log(
    JSON.stringify(
      {
        puuid,
        region,
        shard,
        clientVersion,
        historyKeys: Object.keys(history),
        historyCount: historyItems.length,
        queue,
        filteredHistoryCount: filteredHistoryItems.length,
        firstHistoryItem: historyItems[0] ?? null,
      },
      null,
      2,
    ),
  );
}

const matches = [];

for (const item of filteredHistoryItems.slice(0, limit)) {
  const matchId = firstString(item.MatchID, item.matchID, item.matchId, item.id);

  if (!matchId) {
    continue;
  }

  const details = await requestJson(
    `https://pd.${shard}.a.pvp.net/match-details/v1/matches/${matchId}`,
    { headers: riotHeaders },
  );

  if (debug && matches.length === 0) {
    console.log(
      JSON.stringify(
        {
          matchId,
          detailKeys: Object.keys(details),
          matchInfoKeys: Object.keys(details.matchInfo ?? details.MatchInfo ?? {}),
          playerCount: (details.players ?? details.Players ?? []).length,
          firstPlayer: (details.players ?? details.Players ?? [])[0] ?? null,
          teamCount: (details.teams ?? details.Teams ?? []).length,
          teams: details.teams ?? details.Teams ?? [],
        },
        null,
        2,
      ),
    );
  }

  const normalized = normalizeMatch(details, matchId, puuid, dictionaries);

  if (normalized) {
    matches.push(normalized);
  }
}

if (matches.length === 0) {
  console.log('No importable matches found.');
  process.exit(0);
}

const imported = await requestJson(`${roundCoachUrl}/imports/valorant/local/matches`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ matches }),
});

console.log(JSON.stringify(imported, null, 2));

function normalizeMatch(details, matchId, puuid, dictionaries) {
  const players = details.players ?? details.Players ?? [];
  const player = players.find((candidate) => {
    return sameId(candidate.subject ?? candidate.Subject ?? candidate.puuid, puuid);
  });

  if (!player) {
    return null;
  }

  const matchInfo = details.matchInfo ?? details.MatchInfo ?? {};
  const teams = details.teams ?? details.Teams ?? [];
  const teamId = player.teamId ?? player.TeamID ?? player.teamID;
  const playerTeam = teams.find((team) => sameId(team.teamId ?? team.TeamID ?? team.teamID, teamId));
  const won = Boolean(playerTeam?.won ?? playerTeam?.Won);
  const teamRounds = Number(playerTeam?.roundsWon ?? playerTeam?.RoundsWon ?? 0);
  const enemyRounds = Number(
    teams
      .filter((team) => !sameId(team.teamId ?? team.TeamID ?? team.teamID, teamId))
      .map((team) => team.roundsWon ?? team.RoundsWon ?? 0)
      .sort((left, right) => Number(right) - Number(left))[0] ?? 0,
  );
  const stats = player.stats ?? player.Stats ?? {};
  const roundsPlayed =
    teamRounds > 0 || enemyRounds > 0 ? Math.max(1, teamRounds + enemyRounds) : 24;
  const totalScore = numberOrUndefined(stats.score ?? stats.Score);
  const characterId = firstString(player.characterId, player.CharacterID, player.characterID);
  const mapId = firstString(matchInfo.mapId, matchInfo.MapID, matchInfo.mapID);
  const gameStartMillis = Number(
    matchInfo.gameStartMillis ?? matchInfo.GameStartMillis ?? matchInfo.gameStartTime ?? Date.now(),
  );

  return {
    externalId: matchId,
    map: dictionaries.maps.get(normalizeKey(mapId)) ?? extractMapName(mapId) ?? 'Unknown Map',
    agent: dictionaries.characters.get(normalizeKey(characterId)) ?? 'Unknown Agent',
    result: won ? 'WIN' : 'LOSS',
    score: `${teamRounds || (won ? 13 : 9)}-${enemyRounds || (won ? 9 : 13)}`,
    matchDate: new Date(gameStartMillis).toISOString(),
    kills: numberOrUndefined(stats.kills ?? stats.Kills),
    deaths: numberOrUndefined(stats.deaths ?? stats.Deaths),
    assists: numberOrUndefined(stats.assists ?? stats.Assists),
    combatScore: totalScore != null ? Math.round(totalScore / roundsPlayed) : undefined,
    queueId: firstString(matchInfo.queueId, matchInfo.QueueID, matchInfo.queueID),
    durationSeconds: secondsOrUndefined(matchInfo.gameLengthMillis ?? matchInfo.GameLengthMillis),
    snapshot: compactSnapshot(details),
    scoreboardPlayers: normalizeScoreboardPlayers(
      details,
      dictionaries,
      roundsPlayed,
      puuid,
      accountAlias,
    ),
  };
}

function compactSnapshot(details) {
  const matchInfo = details.matchInfo ?? details.MatchInfo ?? {};
  const teams = details.teams ?? details.Teams ?? [];

  return {
    matchInfo,
    teams,
    roundCount: (details.roundResults ?? details.RoundResults ?? []).length,
    playerCount: (details.players ?? details.Players ?? []).length,
  };
}

function normalizeScoreboardPlayers(
  details,
  dictionaries,
  fallbackRoundsPlayed,
  currentPuuid,
  currentAlias,
) {
  const players = details.players ?? details.Players ?? [];
  const roundResults = details.roundResults ?? details.RoundResults ?? [];
  const firstDuels = calculateFirstDuels(roundResults);
  const multiKills = calculateMultiKills(roundResults);

  return players.map((player, index) => {
    const stats = player.stats ?? player.Stats ?? {};
    const subject = firstString(player.subject, player.Subject, player.puuid);
    const roundsPlayed = Number(stats.roundsPlayed ?? stats.RoundsPlayed ?? fallbackRoundsPlayed);
    const score = Number(stats.score ?? stats.Score ?? 0);
    const damage = calculateDamage(player);
    const shots = calculateShots(stats);
    const characterId = firstString(player.characterId, player.CharacterID, player.characterID);

    const isCurrentUser = sameId(subject, currentPuuid);
    const fallbackName = `Player ${index + 1}`;

    return {
      puuid: subject,
      isCurrentUser,
      gameName: isCurrentUser
        ? firstString(
            currentAlias?.game_name,
            currentAlias?.gameName,
            currentAlias?.acct?.game_name,
            player.gameName,
            player.GameName,
            player.name,
            player.Name,
          ) ?? 'You'
        : firstString(player.gameName, player.GameName, player.name, player.Name) ?? fallbackName,
      tagLine: isCurrentUser
        ? firstString(
            currentAlias?.tag_line,
            currentAlias?.tagLine,
            currentAlias?.acct?.tag_line,
            player.tagLine,
            player.TagLine,
          )
        : firstString(player.tagLine, player.TagLine),
      teamId: String(player.teamId ?? player.TeamID ?? player.teamID ?? 'Unknown'),
      agent: dictionaries.characters.get(normalizeKey(characterId)) ?? 'Unknown Agent',
      competitiveTier: numberOrUndefined(
        player.competitiveTier ?? player.CompetitiveTier ?? player.PlayerCardLevel,
      ),
      kills: Number(stats.kills ?? stats.Kills ?? 0),
      deaths: Number(stats.deaths ?? stats.Deaths ?? 0),
      assists: Number(stats.assists ?? stats.Assists ?? 0),
      score,
      acs: roundNumber(score / Math.max(1, roundsPlayed)),
      adr: damage != null ? roundNumber(damage / Math.max(1, roundsPlayed)) : undefined,
      headshotPercentage: shots.total > 0 ? roundNumber((shots.head / shots.total) * 100) : undefined,
      kastPercentage: undefined,
      firstKills: firstDuels.firstKills.get(normalizeKey(subject)) ?? 0,
      firstDeaths: firstDuels.firstDeaths.get(normalizeKey(subject)) ?? 0,
      multiKills: multiKills.get(normalizeKey(subject)) ?? 0,
    };
  });
}

function calculateDamage(player) {
  const roundDamage = player.roundDamage ?? player.RoundDamage;

  if (!Array.isArray(roundDamage)) {
    return undefined;
  }

  return roundDamage.reduce((total, item) => {
    return total + Number(item.damage ?? item.Damage ?? 0);
  }, 0);
}

function calculateShots(stats) {
  const head = Number(stats.headshots ?? stats.Headshots ?? 0);
  const body = Number(stats.bodyshots ?? stats.Bodyshots ?? 0);
  const leg = Number(stats.legshots ?? stats.Legshots ?? 0);

  return {
    head,
    total: head + body + leg,
  };
}

function calculateFirstDuels(roundResults) {
  const firstKills = new Map();
  const firstDeaths = new Map();

  for (const round of roundResults) {
    const playerStats = round.playerStats ?? round.PlayerStats ?? [];
    const kills = playerStats.flatMap((stat) => {
      return (stat.kills ?? stat.Kills ?? []).map((kill) => ({
        killer: firstString(
          kill.killer,
          kill.Killer,
          stat.subject,
          stat.Subject,
          stat.puuid,
        ),
        victim: firstString(kill.victim, kill.Victim),
        time: Number(kill.gameTime ?? kill.GameTime ?? kill.roundTime ?? kill.RoundTime ?? 0),
      }));
    });
    const firstKill = kills
      .filter((kill) => kill.killer && kill.victim)
      .sort((left, right) => left.time - right.time)[0];

    if (!firstKill) {
      continue;
    }

    incrementMap(firstKills, normalizeKey(firstKill.killer));
    incrementMap(firstDeaths, normalizeKey(firstKill.victim));
  }

  return { firstKills, firstDeaths };
}

function calculateMultiKills(roundResults) {
  const multiKills = new Map();

  for (const round of roundResults) {
    const playerStats = round.playerStats ?? round.PlayerStats ?? [];

    for (const stat of playerStats) {
      const subject = firstString(stat.subject, stat.Subject, stat.puuid);
      const kills = stat.kills ?? stat.Kills ?? [];

      if (subject && kills.length >= 2) {
        incrementMap(multiKills, normalizeKey(subject));
      }
    }
  }

  return multiKills;
}

function buildContentDictionaries(content) {
  return {
    maps: new Map(readContentItems(content, ['Maps', 'maps']).map((item) => [normalizeKey(item.id), item.name])),
    characters: new Map(
      readContentItems(content, ['Characters', 'characters']).map((item) => [
        normalizeKey(item.id),
        item.name,
      ]),
    ),
  };
}

function readContentItems(content, keys) {
  for (const key of keys) {
    const items = content[key];

    if (Array.isArray(items)) {
      return items
        .map((item) => ({
          id: firstString(item.ID, item.id, item.ItemID, item.itemId),
          name: firstString(item.Name, item.name),
        }))
        .filter((item) => item.id && item.name);
    }
  }

  return [];
}

async function fetchPublicValorantDictionaries() {
  const dictionaries = {
    maps: new Map(),
    characters: new Map(),
  };

  try {
    const [maps, agents] = await Promise.all([
      requestJson('https://valorant-api.com/v1/maps'),
      requestJson('https://valorant-api.com/v1/agents?isPlayableCharacter=true'),
    ]);

    for (const map of maps?.data ?? []) {
      addDictionaryValue(dictionaries.maps, map.uuid, map.displayName);
      addDictionaryValue(dictionaries.maps, map.mapUrl, map.displayName);
      addDictionaryValue(dictionaries.maps, extractMapName(map.mapUrl), map.displayName);
    }

    for (const agent of agents?.data ?? []) {
      addDictionaryValue(dictionaries.characters, agent.uuid, agent.displayName);
      addDictionaryValue(dictionaries.characters, agent.assetPath, agent.displayName);
      addDictionaryValue(dictionaries.characters, agent.developerName, agent.displayName);
    }
  } catch {
    return dictionaries;
  }

  return dictionaries;
}

function mergeDictionaries(primary, secondary) {
  return {
    maps: new Map([...secondary.maps, ...primary.maps]),
    characters: new Map([...secondary.characters, ...primary.characters]),
  };
}

function addDictionaryValue(dictionary, key, value) {
  if (!key || !value) {
    return;
  }

  dictionary.set(normalizeKey(key), value);
}

function buildRiotHeaders(entitlements, clientVersion) {
  const accessToken = firstString(entitlements.accessToken, entitlements.access_token);
  const entitlement = firstString(entitlements.token, entitlements.entitlements_token);

  if (!accessToken || !entitlement) {
    throw new Error('Could not resolve access token and entitlement token.');
  }

  if (!clientVersion) {
    throw new Error('Could not resolve VALORANT client version from Riot Client session.');
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Riot-Entitlements-JWT': entitlement,
    'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQ1LjEiLA0KCSJwbGF0Zm9ybUNoaXBzZXQiOiAiVW5rbm93biINCn0=',
    'X-Riot-ClientVersion': clientVersion,
  };
}

function resolveClientVersion(sessions) {
  const values = Object.values(sessions ?? {});

  for (const session of values) {
    const productId = firstString(session?.productId, session?.product_id, session?.launchConfiguration?.productId);

    if (productId && productId !== 'valorant') {
      continue;
    }

    const version = firstString(
      session?.version,
      session?.productVersion,
      session?.product_version,
      session?.launchConfiguration?.version,
    );

    if (version) {
      return version;
    }

    const argumentsText = [
      ...(Array.isArray(session?.launchConfiguration?.arguments)
        ? session.launchConfiguration.arguments
        : []),
      ...(Array.isArray(session?.launchConfiguration?.args)
        ? session.launchConfiguration.args
        : []),
      firstString(session?.launchConfiguration?.arguments, session?.launchConfiguration?.args),
    ]
      .filter(Boolean)
      .join(' ');
    const matched = argumentsText.match(/(?:ares-product-version|product-version)[=\s"]+([^"\s]+)/i);

    if (matched) {
      return matched[1];
    }
  }

  return undefined;
}

async function fetchValorantClientVersion() {
  try {
    const version = await requestJson('https://valorant-api.com/v1/version');
    return firstString(
      version?.data?.riotClientVersion,
      version?.data?.branch && version?.data?.buildVersion
        ? `${version.data.branch}-shipping-${version.data.buildVersion}`
        : undefined,
    );
  } catch {
    return undefined;
  }
}

async function readLockfile(lockfilePath) {
  const resolvedPath =
    lockfilePath ??
    path.join(process.env.LOCALAPPDATA ?? '', 'Riot Games', 'Riot Client', 'Config', 'lockfile');
  const raw = await fs.readFile(resolvedPath, 'utf8');
  const [name, pid, port, password, protocol] = raw.trim().split(':');

  if (!port || !password) {
    throw new Error(`Invalid Riot lockfile format at ${resolvedPath}`);
  }

  return { name, pid, port, password, protocol };
}

function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = options.body;
    const transport = parsed.protocol === 'http:' ? http : https;
    const request = transport.request(
      {
        method: options.method ?? 'GET',
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'http:' ? 80 : 443),
        path: `${parsed.pathname}${parsed.search}`,
        headers: {
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
          ...(options.headers ?? {}),
        },
        ...(parsed.protocol === 'https:'
          ? { rejectUnauthorized: options.rejectUnauthorized ?? true }
          : {}),
      },
      (response) => {
        let data = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`${response.statusCode} ${response.statusMessage}: ${data}`));
            return;
          }

          resolve(data ? JSON.parse(data) : {});
        });
      },
    );

    request.on('error', reject);

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

function parseArgs(values) {
  return values.reduce((accumulator, value, index) => {
    accumulator._ ??= [];

    const matched = value.match(/^--([^=]+)=(.*)$/);

    if (matched) {
      accumulator[matched[1]] = matched[2];
      return accumulator;
    }

    const flag = value.match(/^--(.+)$/);

    if (flag && values[index + 1] && !values[index + 1].startsWith('--')) {
      accumulator[flag[1]] = values[index + 1];
      return accumulator;
    }

    if (!value.startsWith('--') && (index === 0 || !values[index - 1]?.startsWith('--'))) {
      accumulator._.push(value);
    }

    return accumulator;
  }, {});
}

function inferShard(region) {
  const normalized = String(region).toLowerCase();

  if (['br', 'latam', 'na'].includes(normalized)) {
    return 'na';
  }

  if (['eu', 'euw', 'tr', 'ru'].includes(normalized)) {
    return 'eu';
  }

  if (['kr'].includes(normalized)) {
    return 'kr';
  }

  return 'ap';
}

function extractMapName(mapId) {
  const matched = String(mapId ?? '').match(/\/Game\/Maps\/([^/]+)/i);
  return matched?.[1];
}

function firstString(...values) {
  return values.find((value) => typeof value === 'string' && value.length > 0);
}

function normalizeKey(value) {
  return String(value ?? '').toLowerCase();
}

function sameId(left, right) {
  return normalizeKey(left) === normalizeKey(right);
}

function numberOrUndefined(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function secondsOrUndefined(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number / 1000) : undefined;
}

function roundNumber(value) {
  return Number(Number(value).toFixed(1));
}

function incrementMap(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function readPositiveInteger(...values) {
  for (const value of values) {
    const parsed = Number(value);

    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 5;
}

function exitWithUsage(message) {
  console.error(message);
  console.error(
    'Usage: npm run import:valorant -- --token=<roundcoach_jwt> --limit=5 [--region=br] [--shard=na] [--client-version=...]',
  );
  process.exit(1);
}
