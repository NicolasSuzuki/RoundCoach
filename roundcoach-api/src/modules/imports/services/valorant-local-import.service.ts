import { Injectable } from '@nestjs/common';
import { AnalysisProcessingStatus, Prisma } from '@prisma/client';
import { buildAnalysisInsights } from '../../../domain/insight-engine/insight-engine';
import { MatchAnalysisEngineService } from '../../../domain/match-analysis-engine/match-analysis-engine.service';
import { PrismaService } from '../../../database/prisma/prisma.service';
import {
  ImportValorantLocalDto,
  ImportValorantLocalMatchDto,
} from '../dtos/import-valorant-local.dto';

const EXTERNAL_SOURCE = 'valorant-local-client';

@Injectable()
export class ValorantLocalImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchAnalysisEngineService: MatchAnalysisEngineService,
  ) {}

  async importMatches(userId: string, dto: ImportValorantLocalDto) {
    const result = {
      created: 0,
      updated: 0,
      skipped: 0,
      matchIds: [] as string[],
    };

    for (const item of dto.matches) {
      const existing = await this.prisma.match.findUnique({
        where: {
          userId_externalSource_externalId: {
            userId,
            externalSource: EXTERNAL_SOURCE,
            externalId: item.externalId,
          },
        },
        select: { id: true },
      });

      const imported = await this.prisma.$transaction(async (transaction) => {
        const match = await transaction.match.upsert({
          where: {
            userId_externalSource_externalId: {
              userId,
              externalSource: EXTERNAL_SOURCE,
              externalId: item.externalId,
            },
          },
          update: this.buildMatchData(userId, item),
          create: this.buildMatchData(userId, item),
        });

        const metrics = this.matchAnalysisEngineService.analyze({
          result: item.result,
          score: item.score,
          player:
            item.scoreboardPlayers?.find((player) => player.isCurrentUser) ??
            item.scoreboardPlayers?.[0],
          lobbyPlayers: item.scoreboardPlayers,
        });
        const insights = buildAnalysisInsights({
          deathsFirst: metrics.deathsFirst,
          entryKills: metrics.entryKills,
          avgCrosshairScore: metrics.avgCrosshairScore,
          utilityUsageScore: metrics.utilityUsageScore,
          positioningScore: metrics.positioningScore,
        });

        await transaction.analysis.upsert({
          where: { matchId: match.id },
          update: {
            processingStatus: AnalysisProcessingStatus.COMPLETED,
            deathsFirst: metrics.deathsFirst,
            entryKills: metrics.entryKills,
            avgCrosshairScore: metrics.avgCrosshairScore,
            utilityUsageScore: metrics.utilityUsageScore,
            positioningScore: metrics.positioningScore,
            summary: insights.summary,
          },
          create: {
            matchId: match.id,
            processingStatus: AnalysisProcessingStatus.COMPLETED,
            deathsFirst: metrics.deathsFirst,
            entryKills: metrics.entryKills,
            avgCrosshairScore: metrics.avgCrosshairScore,
            utilityUsageScore: metrics.utilityUsageScore,
            positioningScore: metrics.positioningScore,
            summary: insights.summary,
          },
        });

        if (item.snapshot) {
          await transaction.importedMatchSnapshot.upsert({
            where: { matchId: match.id },
            update: {
              externalSource: EXTERNAL_SOURCE,
              externalId: item.externalId,
              queueId: item.queueId,
              durationSeconds: item.durationSeconds,
              rawJson: item.snapshot as Prisma.InputJsonValue,
            },
            create: {
              matchId: match.id,
              externalSource: EXTERNAL_SOURCE,
              externalId: item.externalId,
              queueId: item.queueId,
              durationSeconds: item.durationSeconds,
              rawJson: item.snapshot as Prisma.InputJsonValue,
            },
          });
        }

        if (item.scoreboardPlayers?.length) {
          await transaction.matchScoreboardPlayer.deleteMany({
            where: { matchId: match.id },
          });
          await transaction.matchScoreboardPlayer.createMany({
            data: item.scoreboardPlayers.map((player) => ({
              matchId: match.id,
              puuid: player.puuid,
              isCurrentUser: player.isCurrentUser ?? false,
              gameName: player.gameName,
              tagLine: player.tagLine,
              teamId: player.teamId,
              agent: player.agent,
              competitiveTier: player.competitiveTier,
              kills: player.kills,
              deaths: player.deaths,
              assists: player.assists,
              score: player.score,
              acs: player.acs,
              adr: player.adr,
              headshotPercentage: player.headshotPercentage,
              kastPercentage: player.kastPercentage,
              firstKills: player.firstKills,
              firstDeaths: player.firstDeaths,
              multiKills: player.multiKills,
            })),
          });
        }

        return match;
      });

      result.matchIds.push(imported.id);

      if (existing) {
        result.updated += 1;
      } else {
        result.created += 1;
      }
    }

    return result;
  }

  private buildMatchData(
    userId: string,
    item: ImportValorantLocalMatchDto,
  ): Prisma.MatchUncheckedCreateInput {
    const statLine = [
      item.kills != null && item.deaths != null && item.assists != null
        ? `KDA ${item.kills}/${item.deaths}/${item.assists}`
        : null,
      item.combatScore != null ? `ACS ${Math.round(item.combatScore)}` : null,
    ]
      .filter((value): value is string => Boolean(value))
      .join(' | ');

    return {
      userId,
      map: item.map,
      agent: item.agent,
      result: item.result,
      score: item.score,
      matchDate: item.matchDate,
      notes: statLine
        ? `Importado do client local do VALORANT. ${statLine}`
        : 'Importado do client local do VALORANT.',
      externalSource: EXTERNAL_SOURCE,
      externalId: item.externalId,
    };
  }

}
