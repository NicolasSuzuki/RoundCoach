import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type RiotContentPayload = {
  source: 'riot' | 'fallback';
  locale: string;
  maps: Array<{ id: string; name: string }>;
  agents: Array<{ id: string; name: string }>;
  updatedAt: string;
};

type RiotContentApiResponse = {
  maps?: Array<{ id: string; name: string }>;
  characters?: Array<{ id: string; name: string }>;
};

const FALLBACK_MAPS = [
  'Abyss',
  'Ascent',
  'Bind',
  'Breeze',
  'Fracture',
  'Haven',
  'Icebox',
  'Lotus',
  'Pearl',
  'Split',
  'Sunset',
].map((name) => ({ id: name.toLowerCase(), name }));

const FALLBACK_AGENTS = [
  'Astra',
  'Breach',
  'Brimstone',
  'Chamber',
  'Clove',
  'Cypher',
  'Deadlock',
  'Fade',
  'Gekko',
  'Harbor',
  'Iso',
  'Jett',
  'KAY/O',
  'Killjoy',
  'Neon',
  'Omen',
  'Phoenix',
  'Raze',
  'Reyna',
  'Sage',
  'Skye',
  'Sova',
  'Tejo',
  'Viper',
  'Vyse',
  'Yoru',
].map((name) => ({ id: name.toLowerCase(), name }));

@Injectable()
export class RiotContentService {
  private readonly logger = new Logger(RiotContentService.name);
  private readonly cache = new Map<string, RiotContentPayload>();

  constructor(private readonly configService: ConfigService) {}

  async getContent(locale = 'pt-BR'): Promise<RiotContentPayload> {
    const cachedValue = this.cache.get(locale);

    if (cachedValue) {
      return cachedValue;
    }

    const apiKey = this.configService.get<string>('riot.apiKey', '');

    if (!apiKey) {
      return this.saveAndReturnFallback(locale);
    }

    const region = this.configService.get<string>('riot.apiRegion', 'eu');

    try {
      const response = await fetch(
        `https://${region}.api.riotgames.com/val/content/v1/contents?locale=${encodeURIComponent(locale)}`,
        {
          headers: {
            'X-Riot-Token': apiKey,
          },
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `Riot content request failed status=${response.status}; falling back to local content`,
        );
        return this.saveAndReturnFallback(locale);
      }

      const data = (await response.json()) as RiotContentApiResponse;

      const payload: RiotContentPayload = {
        source: 'riot',
        locale,
        maps: (data.maps ?? [])
          .map((item) => ({ id: item.id, name: item.name }))
          .sort((left, right) => left.name.localeCompare(right.name)),
        agents: (data.characters ?? [])
          .map((item) => ({ id: item.id, name: item.name }))
          .sort((left, right) => left.name.localeCompare(right.name)),
        updatedAt: new Date().toISOString(),
      };

      this.cache.set(locale, payload);
      return payload;
    } catch (error) {
      this.logger.warn(
        `Riot content request crashed; falling back to local content: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return this.saveAndReturnFallback(locale);
    }
  }

  private saveAndReturnFallback(locale: string): RiotContentPayload {
    const payload: RiotContentPayload = {
      source: 'fallback',
      locale,
      maps: FALLBACK_MAPS,
      agents: FALLBACK_AGENTS,
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(locale, payload);
    return payload;
  }
}
